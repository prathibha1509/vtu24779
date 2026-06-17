import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const loggerApi=axios.create({
    baseURL: process.env.LOG_BASE_URL,
    headers:{
        Authorization:`Bearer ${ process.env.ACCESS_TOKEN}`,
        "Content-Type":"application/json",
    },
    timeout:5000,
});
export default loggerApi;

