import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const loggerApi=axios.create({
    baseURL: process.env.LOG_BASE_URL,
    headers:{
        "Content-Type":"application/json",
    },
    timeout:5000,
});

loggerApi.interceptors.request.use((config) => {
    if (process.env.ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }
    return config;
});

export default loggerApi;

