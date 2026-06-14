import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "../../db";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createuserintoDB(req.body);
    res.status(200).json({
      status: true,
      message: "user created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to get the user",
      error:error
    });
  }
};

const loginUser = async(req: Request, res: Response)=>{
    try{
        

        const result= await userService.getuserfromDB(req.body)
        const {accessToken} = result;
        res.cookie("accessToken",accessToken,{
          secure:false,
          httpOnly:true,
          sameSite:'lax'
        })
            res.status(200).json({
                message : "Login successful",
                data:result
            })

    }
    catch(error){
        res.status(500).json({
      success: false,
      message: "something went wrong!!",
      error:error
    });

    }
}

export const userController = {
  createUser,
  loginUser
};
