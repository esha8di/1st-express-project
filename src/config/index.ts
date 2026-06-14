import dotenv from "dotenv"
import path from "node:path"


dotenv.config({
    path: path.resolve(process.cwd(), ".env")
})


const config = {
    port: Number(process.env.PORT),
    connectionString : process.env.CONNECTION_STRING,
    secret: process.env.SELECT
}


export default config;
