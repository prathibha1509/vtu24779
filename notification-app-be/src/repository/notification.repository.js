import axios from "axios";
import { log } from "../../../logging-middleware/src/index.js";

class NotificationRepository {
    constructor() {
        this.baseUrl = process.env.BASE_URL;
    }

    /**
     * Fetch notifications from the external evaluation service.
     * @param {string} token Access token to authorize the request
     * @returns {Promise<Array>} List of notifications
     */
    async fetchExternalNotifications(token) {
        try {
            const response = await axios.get(`${this.baseUrl}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 5000,
            });

            return response.data?.notifications || [];
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            
            // Log only ERROR for repository
            await log(
                "backend",
                "error",
                "repository",
                `Failed fetching notifications from external API: ${errorMessage}`
            );
            
            throw error;
        }
    }
}

export default new NotificationRepository();
