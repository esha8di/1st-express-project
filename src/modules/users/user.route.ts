import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

export const router = Router();

router.post("/signup",auth("maintainer"), userController.createUser);
router.post("/login",userController.loginUser);

const userrouter = router;
export default userrouter;