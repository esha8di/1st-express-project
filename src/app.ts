 import  express, { type Application ,type Request, type Response} from "express";
const app:Application =express();
import { Router } from "express";
import { pool } from "./db";

export const router = Router();

app.use(express.json());
app.use(router)
router.post("/api/auth/signup", async (req: Request, res: Response) => {
    const {name, email,role,password } = req.body;
    const result = await pool.query(`
        INSERT INTO users(name,email,role,password) VALUES($1,$2,COALESCE($3,'contributor'),$4) RETURNING *
        ` ,[name,email,role, password],
    )
    console.log(result)
    res.status(200).json({
        message:"user created successfully",
        data:result.rows[0]
    })
});

export default app;