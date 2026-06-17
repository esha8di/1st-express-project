 import  express, { type Application ,type Request, type Response} from "express";
const app:Application =express();
import { Router } from "express";

export const router = Router();

app.use(express.json());
app.use(router)
router.post("/api/auth/signup", (req: Request, res: Response) => {
    const {name,email,role,password}= req.body;
    console.log(name)
});

export default app;