import { pool } from "../../db";
import bcrypt from "bcrypt";
import type { IUSER, IUserLogin } from "./user.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const createuserintoDB = async (payload: IUSER) => {
  const { name, email, role, password } = payload;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users(name,email,role,password) VALUES($1,$2,COALESCE($3,'contributor'),$4) RETURNING id,name,email,role,created_at,updated_at`,
    [name, email, role, hashPassword],
  );
  return result;
};

const getuserfromDB = async (payload: IUserLogin) => {
  const { email, password } = payload;
  const user = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email],
  );
  if (user.rows.length === 0) {
    throw new Error("Invalid credential!");
  }
  const comparePassword = await bcrypt.compare(password, user.rows[0].password);
  if (!comparePassword) {
    throw new Error("Invalid credential!");
  }
  const jwtPayload: JwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    role: user.rows[0].role,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" });
  return {
    accessToken,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      created_at: user.rows[0].created_at,
      updated_at: user.rows[0].updated_at,
    },
  };
};

export const userService = {
  createuserintoDB,
  getuserfromDB,
};
