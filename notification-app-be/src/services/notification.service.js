import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { log } from "../../../logging-middleware/src/index.js";
import notificationRepository from "../repository/notification.repository.js";

class NotificationService {
    constructor() {
        this.customNotifications = [];
        this.readNotificationIds = new Set();
        this.deletedNotificationIds = new Set();
        this.authUrl = `${process.env.BASE_URL}/auth`;
    }

    /**
     * Decode JWT token payload and check if it is expired.
     * @param {string} token 
     * @returns {boolean} True if token is valid, false if expired or invalid
     */
    isTokenValid(token) {
        if (!token) return false;
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return false;

            const payload = JSON.parse(
                Buffer.from(parts[1], "base64").toString("utf8")
            );
            
            const exp = payload.exp;
            // Token is valid if current time is before expiration minus 60s buffer
            return (Date.now() / 1000) < (exp - 60);
        } catch (error) {
            return false;
        }
    }

    /**
     * Ensure we have a valid access token. If current is expired, request a new one.
     */
    async getValidToken() {
        let token = process.env.ACCESS_TOKEN;

        if (this.isTokenValid(token)) {
            return token;
        }

        await log(
            "backend",
            "info",
            "service",
            "Access token expired or missing. Attempting authentication to obtain a new token."
        );

        try {
            const payload = {
                email: "vtu24779@veltech.edu.in",
                name: "soma prathibha",
                accessCode: "juFphv",
                rollNo: "24779",
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET
            };

            const response = await axios.post(this.authUrl, payload, {
                headers: { "Content-Type": "application/json" },
                timeout: 5000
            });

            const newToken = response.data?.access_token;
            if (!newToken) {
                throw new Error("No access token returned from authentication endpoint");
            }

            // Update process.env so that other packages/middleware pick it up
            process.env.ACCESS_TOKEN = newToken;

            await log(
                "backend",
                "info",
                "service",
                "Authentication successful, new access token acquired."
            );

            return newToken;
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            await log(
                "backend",
                "error",
                "service",
                `Authentication failed: ${errMsg}`
            );
            throw new Error(`Failed to authenticate with external service: ${errMsg}`);
        }
    }

    /**
     * Get all notifications (merged and filtered).
     */
    async getNotifications() {
        await log(
            "backend",
            "info",
            "service",
            "Fetching notifications from external API"
        );

        let externalNotifications = [];
        try {
            const token = await this.getValidToken();
            externalNotifications = await notificationRepository.fetchExternalNotifications(token);
        } catch (error) {
            // Log service failure but don't crash, return custom notifications only
            await log(
                "backend",
                "error",
                "service",
                `Service failed to fetch external notifications: ${error.message}`
            );
        }

        // Map external notifications to clean lowercase keys
        const mappedExternal = externalNotifications.map(n => ({
            id: n.ID,
            type: n.Type,
            message: n.Message,
            timestamp: n.Timestamp,
            isExternal: true
        }));

        // Merge with custom notifications
        const merged = [...mappedExternal, ...this.customNotifications];

        // Filter deleted and map read status
        const result = merged
            .filter(n => !this.deletedNotificationIds.has(n.id))
            .map(n => ({
                ...n,
                read: this.readNotificationIds.has(n.id)
            }));

        // Sort newest first
        result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return result;
    }

    /**
     * Create a new custom local notification.
     */
    async createNotification({ type, message }) {
        if (!type || !message) {
            throw new Error("Type and message are required fields");
        }

        const allowedTypes = ["Event", "Placement", "Result"];
        if (!allowedTypes.includes(type)) {
            throw new Error(`Invalid type. Must be one of: ${allowedTypes.join(", ")}`);
        }

        // Format: YYYY-MM-DD HH:mm:ss
        const now = new Date();
        const timestamp = now.toISOString().replace("T", " ").substring(0, 19);

        const newNotification = {
            id: uuidv4(),
            type,
            message,
            timestamp,
            isExternal: false
        };

        this.customNotifications.push(newNotification);

        await log(
            "backend",
            "info",
            "service",
            `Created custom local notification: ${newNotification.id}`
        );

        return {
            ...newNotification,
            read: false
        };
    }

    /**
     * Mark a notification as read.
     */
    async markAsRead(id) {
        if (!id) {
            throw new Error("Notification ID is required");
        }
        this.readNotificationIds.add(id);

        await log(
            "backend",
            "info",
            "service",
            `Notification marked as read: ${id}`
        );

        return { success: true };
    }

    /**
     * Soft delete a notification.
     */
    async deleteNotification(id) {
        if (!id) {
            throw new Error("Notification ID is required");
        }
        this.deletedNotificationIds.add(id);

        await log(
            "backend",
            "info",
            "service",
            `Notification deleted: ${id}`
        );

        return { success: true };
    }
}

export default new NotificationService();
