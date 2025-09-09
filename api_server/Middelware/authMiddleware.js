import jwt from "jsonwebtoken";


export function authMiddleware(req,res,next){
    const token=req.header("Authorization")
    if(!token){
         return res.status(401).json({ error: "Access denied" });
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    req.userId=decoded.userId;
    next();

}
