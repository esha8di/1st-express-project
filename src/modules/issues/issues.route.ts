import { Router , type Request, type Response} from "express";
import auth from "../../middleware/auth";


export const router = Router();

router.post("/",auth('contributor','maintainer') ,async(req:Request, res:Response)=>{
    try{
        const result= await req.body
    }
    catch(error){
        
    }
})