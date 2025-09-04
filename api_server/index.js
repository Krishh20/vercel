import express from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { z} from "zod"

import {createClient} from "@clickhouse/client"
import {Kafka} from "kafkajs"
import { v4 as uuidv4 } from "uuid";
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "./generated/prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 9000;

const prisma =new PrismaClient()

app.use(express.json());

const ecsClient = new ECSClient({
    region:process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const kafka=new Kafka({
  clientId:`api-server`,
  brokers:[process.env.KAFKA_BROKER],
     ssl: {
    ca:[fs.readFileSync(path.join(__dirname,"kafka.pem"),"utf-8")]
  },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
})

const consumer=kafka.consumer({groupId:"api-server-logs-consumer"})

const config = {
  CLUSTER: "",
  TASK: "",
};

const client=createClient({
  host:process.env. CLICKHOUSE_HOST,
  database:"default",
  username:process.env.CLICKHOUSE_USERNAME,
  password:process.env.CLICKHOUSE_PASSWORD
})

app.post("/project",async(req,res)=>{

const schema=z.object({
  name:z.string(),
  gitURL:z.string(),

})
const safeParseResult=schema.safeParse(req.body)
if(safeParseResult.error) return res.status(400).json({
  error:safeParseResult.error
})
const {name, gitURL}=safeParseResult.data

const project= await prisma.project.create({
  data:{
   name, gitURL, subDomain:generateSlug()
  }
})
return res.json({status:"success", data:{project}})
})

app.post("/deploy", async(req, res) => {
  const { projectId } = req.body;
  const project=await prisma.project.findUnique({where:{id:projectId}})
  if(!project) return res.status(404).json({error:"project not found"})

    //check if there is no running deployment
  const deployment=await prisma.deployment.create({
    project:{connect:{id:process}},
    status:"QUEUED"
  })

  //CLICKHOUSE COLUMNAR DB

  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "Enabled",
        subnets: ["", "", ""],
        securityGroups: [""],
      },
      overrides: {
        containerOverrides: {
          name: "builder-image",
          environment: [
            {
              name: GIT_REPOSITORY_URL,
              value: project.gitURL,
            },
            {
                name:PROJECT_ID,
                value:projectId
            },
            {
              name:DEPLOYMENT_ID,
              value:deployment.id
            }
          ],
        },
      },
    },
  });
  await ecsClient.send(command)
  return res.json({
    status:"queued",
    data:{
     deploymentId:deployment.id
    }
  })
});

app.get("/logs/:id",async(req,res)=>{
  const id=req.params
  const logs=await client.query({
    query:`SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id={deployment} `,
    query_params:{
      deployment_id:id
    },
     format:"JSONEachRow"
  })
  const rawLOgs=await  logs.json() //converted to json
  return res.json({rawLOgs})
})

async function initKafkaConsumer() {
  autoCommit:false
  await consumer.connect()
  await consumer.subscribe({ topic: "container-logs" });
  await consumer.run({
    eachBatch:async function ({batch, heartbeat, commitOffsetNecessary,resolveOffset}) {
     const messages=batch.messages
     console.log(`Recv. ${messages.length} messages...`)
     for(const message of messages){
      const stringMessage=message.value.toString()
      const {PROJECT_ID, DEPLOYMENT_ID, log}=JSON.parse(stringMessage)

   const {query_id} =   await client.insert({
        table:"log_events",
        values:[{event_id:uuidv4(), deployment_id:DEPLOYMENT_ID, log}],
        format:"JSONEachRow"
      })
         resolveOffset(message.offset)
 await commitOffsetNecessary(message.offset)
 await heartbeat()
     }
    }
  })

}
initKafkaConsumer()

app.listen(port, () => {
  console.log("listening");
});
