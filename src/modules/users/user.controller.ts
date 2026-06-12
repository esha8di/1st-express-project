
import  express, { type Application ,type Request, type Response} from "express";
import { pool } from "../../db";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    

    try{
         const result = await userService.createuserintoDB(req.body)
    res.status(200).json({
        message:"user created successfully",
        data:result.rows[0]
    })

    }
    catch(error){
        res.status(500).json({
        success: false,
        message: "Failed to create user"
    });

    }
   
};

export const userController= {
    createUser
}