import express from "express";
import cors from "cors";
import helmet from "helmet";

import { loggerMiddleware } from "../../logging-middleware/src/index.js";
import errorMiddleware from "./middleware/error.middleware.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(loggerMiddleware);

app.use("/api", notificationRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Notification Backend Running"
    });
});

app.use(errorMiddleware);

export default app;