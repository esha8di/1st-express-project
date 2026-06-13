import { Router } from "express";
import { userController } from "./user.controller";

export const router = Router();

router.post("/signup", userController.createUser);
router.post("/login",userController.loginUser)

const userrouter = router;
export default userrouter;