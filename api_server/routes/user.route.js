import express from "express"
const router = express.Router();
import {register,login, getAllProjects} from "../controller/user.controller.js"
import verifyToken from "../middleware/auth.middleware.js";


router.post("/register",register);
router.post("/login",login);
router.get("/getProjects",verifyToken,getAllProjects)

export default router;