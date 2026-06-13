import { pool } from "../../db";
import bcrypt from "bcrypt";
import type { IUSER } from "./user.interface";
import jwt, { type JwtPayload } from "jsonwebtoken"
const createuserintoDB = async (payload: IUSER) => {
  const { name, email, role, password } = payload;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `
        INSERT INTO users(name,email,role,password) VALUES($1,$2,COALESCE($3,'contributor'),$4) RETURNING id,name,email,role,created_at,updated_at
        `,
    [name, email, role, hashPassword],
  );
  return result;
};

const getuserfromDB = async (payload: any) => {
  const { email, password } = payload;
  const user=await pool.query(
    `
            SELECT id,name,email,password,role,created_at,updated_at FROM users where email=$1 `,
    [email],
  );
  if(user.rows.length === 0){
    throw new Error("Invalid credential!");
  }
  const comparePassword = await bcrypt.compare(password,user.rows[0].password);
  if(!comparePassword){
     throw new Error("Invalid credential!");
  }
  const jsonPayload :any={
    id:user.rows[0].id,
    name:user.rows[0].name,
    role:user.rows[0].role
  } as JwtPayload;

  const accessToken = jwt.sign(jsonPayload,"34345",{expiresIn:"1d"});
  return {accessToken}
};

export const userService = {
  createuserintoDB,
  getuserfromDB
};
