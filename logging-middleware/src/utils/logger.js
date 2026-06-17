import loggerAPI from "../config/logger.config.js";

const allowedStacks = ["backend", "frontend"];

const allowedLevels = [
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
];

const allowedPackages = [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",

    "api",
    "component",
    "hook",
    "page",
    "state",
    "style",

    "auth",
    "config",
    "middleware",
    "utils",
];

const log = async (
    stack,
    level,
    packageName,
    message
) => {

    try {

        if (!allowedStacks.includes(stack))
            throw new Error("Invalid stack");

        if (!allowedLevels.includes(level))
            throw new Error("Invalid level");

        if (!allowedPackages.includes(packageName))
            throw new Error("Invalid package");

        await loggerAPI.post("/logs", {
            stack,
            level,
            package: packageName,
            message,
        });

    } catch (error) {

        // Never crash application because logging failed

        console.error(
            "Logging Failed:",
            error.response?.data || error.message
        );
    }

};

export default log;