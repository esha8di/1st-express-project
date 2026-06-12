 import  express, { type Application} from "express";
const app:Application =express();
import { Router } from "express";

import userrouter from "./modules/users/user.route";

export const router = Router();

app.use(express.json());
app.use(router)
app.use("/api/auth",userrouter)

export default app;