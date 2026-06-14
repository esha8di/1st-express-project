import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

type USER_ROLE = "contributor" | "maintainer";
const auth = (...roles:USER_ROLE[]) =>{
    return async(req:Request, res:Response, next:NextFunction) =>{
        console.log(req.headers.authorization)
        next()
    }
}
export default auth;