import { pool } from "../../db"

const createuserintoDB = async(payload:any) =>{
    const {name, email,role,password } = payload;
    const result = await pool.query(`
        INSERT INTO users(name,email,role,password) VALUES($1,$2,COALESCE($3,'contributor'),$4) RETURNING *
        ` ,[name,email,role, password],
    )
    return result
}

export const userService={
    createuserintoDB
}