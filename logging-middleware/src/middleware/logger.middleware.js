import log from "../utils/logger.js";

const loggerMiddleware = async (
    req,
    res,
    next
) => {

    const start = Date.now();

    await log(
        "backend",
        "info",
        "middleware",
        `${req.method} ${req.originalUrl} request received`
    );

    res.on("finish", async () => {

        const duration = Date.now() - start;

        await log(
            "backend",
            "info",
            "middleware",
            `${req.method} ${req.originalUrl} completed with ${res.statusCode} in ${duration} ms`
        );

    });

    next();
};

export default loggerMiddleware;