import { Router } from "express";

export const router = Router();

router.post("/api/auth/signup", (req: Request, res: Response) => {
    const {name, email,role,password } = req.body;
    console.log(name);
});
