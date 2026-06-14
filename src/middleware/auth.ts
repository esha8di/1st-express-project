import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
type USER_ROLE = "contributor" | "maintainer";
const auth = (...roles: USER_ROLE[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        message: "unauthorized access !!",
      });
    }

    const decodedToken = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    const user = await pool.query(
      `
            SELECT * FROM users where email = $1`,
      [decodedToken.email],
    );

    if (user.rows.length === 0) {
      res.status(401).json({
        message: "user not found !!",
      });
    }

    if (user.rows.length && !roles.includes(user.rows[0].role)){
        res.status(401).json({
            message:"This user does not have the access!!"
        })
    }
    next();
  };
};
export default auth;
