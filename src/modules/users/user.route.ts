import { Router } from "express";

export const router = Router();

router.post("/", (req: Request, res: Response) => {
    const body = req.body;
    console.log(body)
});
