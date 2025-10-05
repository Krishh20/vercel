import {exec} from "child_process"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url";
import {S3Client,PutObjectCommand } from "@aws-sdk/client-s3"
import mime from "mime-types"
import {Kafka} from "kafkajs"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROJECT_ID=  process.env.PROJECT_ID
const DEPLOYMENT_ID=process.env.DEPLOYMENT_ID
const kafka=new Kafka({
    clientId:`docker-build-server-${DEPLOYMENT_ID}`, //why unique client id for every delpoyment
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

const producer=kafka.producer()

async function publishLog(log){

   await producer.send({topic:"container-logs", messages:[{key:'log',value:JSON.stringify({PROJECT_ID,DEPLOYMENT_ID,log})}]})
}


const s3client = new S3Client({
     region:process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  },
});




async function init() {
    await producer.connect();

    console.log("Executing script.js")
    await publishLog("Build Started...")
    const outDirPath=path.join(__dirname, "output")
          //validation
    const p=exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on("data",(data)=>{
     console.log(data.toString())

    } ) //capturing logs of terminal , installing npm package logs

     p.stdout.on("error", async (err) => {
    console.error("Stream error:", err);
     await publishLog(err.message || err.toString());
  });

    //after build read dist folder , /output contain all files of repo, /dist static files
    p.on("close",async ()=>{
        console.log("build complete")
        console.log(__dirname);
        await publishLog("Build complete")
        const distFolderPath=path.join(__dirname,"output", "dist")
        console.log("dist fold path",distFolderPath)
        const distFolderContents=fs.readdirSync(distFolderPath,{ recursive:true}) //array contains all files of /dist
       await publishLog("Starting to upload")
        for(const file of distFolderContents){
            const filePath=path.join(distFolderPath, file)

            console.log("uploading ", filePath)
            if(fs.lstatSync(filePath).isDirectory()) continue  //only file path are needed to store on s3
            await publishLog(`uploading ${file}`)
            const command= new PutObjectCommand({
                Bucket:process.env.AWS_S3_BUCKET_NAME,
                Key:`__outputs/${PROJECT_ID}/${file}`, // outputs/projid/filename
                Body:fs.createReadStream(filePath), //actual body of file
                 ContentType:mime.lookup(filePath) || undefined
                    //dynamic contenttype, donno which file gng to be of wt contenttype
            })

            await s3client.send(command);
            console.log("uploaded ", filePath)
        }
        await publishLog("Done")
        console.log("Done")
         process.exit(0) //to kill container
    })
}

init()
