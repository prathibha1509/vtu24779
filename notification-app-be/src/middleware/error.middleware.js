import { log } from "../../../logging-middleware/src/index.js";

const errorMiddleware = async (err, req, res, next) => {

    await log(
        "backend",
        "fatal",
        "middleware",
        err.message
    );

    res.status(err.status || 500).json({

        success: false,

        message: err.message || "Internal Server Error"

    });

};

export default errorMiddleware;