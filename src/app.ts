 import  express, { type Application ,type Request, type Response} from "express";
const app:Application =express();
import { Router } from "express";

export const router = Router();

app.use(express.json());
app.use(router)
router.post("/", (req: Request, res: Response) => {
    const body = req.body;
    console.log(body)
});

export default app;