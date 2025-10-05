import express from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import {  z} from "zod"
import cors from "cors";
import {createClient} from "@clickhouse/client"
import {Kafka} from "kafkajs"
import { v4 as uuidv4 } from "uuid";
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "./generated/prisma/client.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { authMiddleware } from "./Middelware/authMiddleware.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 9000;

app.use(
  cors({
    origin: true, // Reflects the request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
  CLUSTER: process.env.ECS_CLUSTER,
  TASK: process.env.ECS_TASK,
};

const client=createClient({
  host:process.env. CLICKHOUSE_HOST,
  database:"default",
  username:process.env.CLICKHOUSE_USERNAME,
  password:process.env.CLICKHOUSE_PASSWORD
})

const userSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(6, { message: "Password should have minimum length of 8" })
    .max(15, "Password is too long"),
});

app.post("/user/register",async(req,res)=>{

const safeParseResult=userSchema.safeParse(req.body)
if(safeParseResult.error)  return res.status(400).json({
  error:safeParseResult.error
})
//create User model, import here
const {username, password}=req.body
const existingUser=await prisma.user.findUnique({
  where:{
    username
  }
})

if(existingUser) return res.status(400).json({ message: "username already exists" });

const hashedPassword= await bcrypt.hash(password,10)
const user=await prisma.user.create({
  data:{
    username, password:hashedPassword
  }
})
const token=jwt.sign({userId:user.id},process.env.JWT_SECRET)
res.status(201).json({
      message: "user registered successfully",
      success: true,
      user: {
        id: user.id,
        username: user.username,
         token: token,
      },
    });
})

app.post("/user/login",async(req,res)=>{
const safeParseResult=userSchema.safeParse(req.body)
if(safeParseResult.error)  return res.status(400).json({
  error:safeParseResult.error
})
//create User model, import here
const {username, password}=req.body
const user=await prisma.user.findUnique({
  where:{
    username
  }
})
  if (!user) {
      return res.status(400).json({ message: "invalid username or password" });
    }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "invalid username or password" });
    }

    const token=jwt.sign({userId:user.id},process.env.JWT_SECRET)
     res.status(200).json({ message: "login success", token:token,authName:username })
})
//add authmiddleware
app.get("/user/getProjects",authMiddleware,async(req,res)=>{
  const projects = await prisma.project.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        deployments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
    res.status(200).json({ projects });
})

app.post("/project",authMiddleware,async(req,res)=>{

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
   name, gitURL, subDomain:generateSlug(),  userId: req.userId,
  }
})
return res.json({status:"success", data:{project}})
})

app.post("/project/deploy",  authMiddleware,async(req, res) => {
  const { projectId } = req.body;
  const project=await prisma.project.findUnique({where:{id:projectId}})
  if(!project) return res.status(404).json({error:"project not found"})

    //check if there is no running deployment
const deployment = await prisma.deployment.create({
  data: {
    project: { connect: { id: projectId } },
    status: "QUEUED",
  },
});


  //CLICKHOUSE COLUMNAR DB
 const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-0f70d24abfd484dac",
          "subnet-02027e81b2bc35a1c",
          "subnet-04fb41e96c234f686"
        ],
        securityGroups: ["sg-0111dcbf3e21e7367"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image-krish",
          environment: [
           { name: "GIT_REPOSITORY_URL", value: project.gitURL },
              { name: "PROJECT_ID", value: project.id },
              { name: "DEPLOYMENT_ID", value: deployment.id },
              { name: "AWS_REGION", value: process.env.AWS_REGION },
              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID,
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY,
              },
              {
                name: "AWS_S3_BUCKET_NAME",
                value: process.env.AWS_S3_BUCKET_NAME,
              },
              { name: "KAFKA_BROKER", value: process.env.KAFKA_BROKER },
              { name: "KAFKA_USERNAME", value: process.env.KAFKA_USERNAME },
              { name: "KAFKA_PASSWORD", value: process.env.KAFKA_PASSWORD },
          ],
        },
      ],
    },
  });
  await ecsClient.send(command)
  return res.json({
    status:"queued",

     deploymentId:deployment.id

  })
});

app.get("/project/logs/:id", async (req, res) => {
  const { id } = req.params;
 const logs = await client.query({
      query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
      query_params: {
        deployment_id: id,
      },
      format: "JSONEachRow",
    });
    const rawLogs = await logs.json();
    res.status(200).json({
      logs: rawLogs,
    });
});



async function initKafkaConsumer() {
  autoCommit:false
  await consumer.connect()
  await consumer.subscribe({ topic: "container-logs" });
  await consumer.run({
    eachBatch:async function ({batch, heartbeat, commitOffsetsIfNecessary,resolveOffset}) {
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
 await commitOffsetsIfNecessary(message.offset)
 await heartbeat()
     }
    }
  })

}
initKafkaConsumer()

app.listen(port, () => {
  console.log("listening");
});
