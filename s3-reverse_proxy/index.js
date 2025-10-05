import express from "express"
import { PrismaClient } from "./generated/prisma/client.js";
import httpProxy from "http-proxy";

const proxy = new httpProxy();
const app=express();
const port=8000;
const prismaClient=new PrismaClient()
const Basepath=process.env.BASEPATH



app.use(async(req,res)=>{
const hostName=req.hostname //a1.localhost:8000
const subdomain=hostName.split('.')[0]
//custom Domain-Db query
//db query-prisma
//kafka event page visit

const project=await prismaClient.project.findFirst({
    where:{
        subDomain:subdomain
    }
})

console.log(project)

if(!project)  return res.status(404).json({message:"project not found"});
console.log("projectId",project.id)
const resolveTo=`${Basepath}/${project.id}`
return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
})

proxy.on("proxyReq",(proxyReq, req, res)=>{
    const url=req.url
    if(url==="/"){
        proxyReq.path+="index.html"
    }

})
app.listen(port, ()=>{
    console.log("listening")
})
