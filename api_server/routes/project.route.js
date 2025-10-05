import express from "express"
import { createProject, deployProject, getLogs } from "../controller/project.controller.js";


const router = express.Router();

router.post("/",createProject)

router.post("/deploy",deployProject);
router.get("/logs/:id",getLogs);

export default router