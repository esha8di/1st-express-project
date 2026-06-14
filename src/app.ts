 import  express, { type Application} from "express";
const app:Application =express();
import { Router } from "express";
import cookieParser from "cookie-parser"
import userrouter from "./modules/users/user.route";

export const router = Router();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true })); // will accept nested data
app.use(cookieParser())
app.use(router);
app.use("/api/auth",userrouter);



export default app;