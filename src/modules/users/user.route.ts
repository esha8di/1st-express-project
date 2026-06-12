import { Router } from "express";
import { userController } from "./user.controller";

export const router = Router();

router.post("/signup", userController.createUser)

const userrouter = router;
export default userrouter;