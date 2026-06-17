import notificationService from "../services/notification.service.js";
import { log } from "../../../logging-middleware/src/index.js";

class NotificationController {
    /**
     * Get all notifications
     */
    async getNotifications(req, res, next) {
        await log(
            "backend",
            "info",
            "controller",
            "GET /api/notifications request received"
        );

        try {
            const notifications = await notificationService.getNotifications();
            
            await log(
                "backend",
                "info",
                "controller",
                "GET /api/notifications completed successfully"
            );

            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (error) {
            await log(
                "backend",
                "error",
                "controller",
                `GET /api/notifications failed: ${error.message}`
            );
            next(error);
        }
    }

    /**
     * Create a new custom local notification
     */
    async createNotification(req, res, next) {
        await log(
            "backend",
            "info",
            "controller",
            "POST /api/notifications request received"
        );

        const { type, message } = req.body;

        if (!type || !message) {
            const warnMsg = "Validation failure: Type and message are required";
            await log("backend", "warn", "controller", warnMsg);
            return res.status(400).json({
                success: false,
                message: "Type and message are required fields"
            });
        }

        const allowedTypes = ["Event", "Placement", "Result"];
        if (!allowedTypes.includes(type)) {
            const warnMsg = `Validation failure: Invalid type '${type}'. Allowed: ${allowedTypes.join(", ")}`;
            await log("backend", "warn", "controller", warnMsg);
            return res.status(400).json({
                success: false,
                message: `Invalid type. Allowed types: ${allowedTypes.join(", ")}`
            });
        }

        try {
            const newNotification = await notificationService.createNotification({ type, message });

            await log(
                "backend",
                "info",
                "controller",
                `POST /api/notifications completed successfully for ID ${newNotification.id}`
            );

            res.status(201).json({
                success: true,
                data: newNotification
            });
        } catch (error) {
            await log(
                "backend",
                "error",
                "controller",
                `POST /api/notifications failed: ${error.message}`
            );
            next(error);
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(req, res, next) {
        const { id } = req.params;

        await log(
            "backend",
            "info",
            "controller",
            `PATCH /api/notifications/${id}/read request received`
        );

        try {
            const result = await notificationService.markAsRead(id);

            await log(
                "backend",
                "info",
                "controller",
                `PATCH /api/notifications/${id}/read completed successfully`
            );

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            await log(
                "backend",
                "error",
                "controller",
                `PATCH /api/notifications/${id}/read failed: ${error.message}`
            );
            next(error);
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(req, res, next) {
        const { id } = req.params;

        await log(
            "backend",
            "info",
            "controller",
            `DELETE /api/notifications/${id} request received`
        );

        try {
            const result = await notificationService.deleteNotification(id);

            await log(
                "backend",
                "info",
                "controller",
                `DELETE /api/notifications/${id} completed successfully`
            );

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            await log(
                "backend",
                "error",
                "controller",
                `DELETE /api/notifications/${id} failed: ${error.message}`
            );
            next(error);
        }
    }

    /**
     * Proxy logs from client (frontend) securely
     */
    async proxyClientLog(req, res, next) {
        const { stack, level, package: packageName, message } = req.body;

        // The stack must be frontend per React Logging rules
        if (stack !== "frontend") {
            const warnMsg = "Client logging proxy validation failed: stack must be 'frontend'";
            await log("backend", "warn", "controller", warnMsg);
            return res.status(400).json({
                success: false,
                message: "Only 'frontend' stack logging is allowed through this proxy"
            });
        }

        if (!level || !packageName || !message) {
            const warnMsg = "Client logging proxy validation failed: missing level, package, or message";
            await log("backend", "warn", "controller", warnMsg);
            return res.status(400).json({
                success: false,
                message: "level, package, and message are required fields"
            });
        }

        try {
            await log(stack, level, packageName, message);
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
