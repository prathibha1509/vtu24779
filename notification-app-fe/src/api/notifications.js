import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Log a frontend event to the backend log proxy.
 * @param {string} level 'info' | 'warn' | 'error' | 'fatal'
 * @param {string} packageName e.g., 'page', 'component', 'api'
 * @param {string} message Log message
 */
export async function sendLog(level, packageName, message) {
    try {
        await apiClient.post("/logs", {
            stack: "frontend",
            level,
            package: packageName,
            message,
        });
    } catch (error) {
        console.error("Failed to forward frontend log:", error.message);
    }
}

// Intercept responses to automatically log API failures to the backend logger
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const url = error.config?.url || "unknown";
        const method = error.config?.method?.toUpperCase() || "unknown";
        const status = error.response?.status || "network error";
        const message = error.response?.data?.message || error.message;

        // Log API Failure - React Logging Rule
        await sendLog(
            "error",
            "api",
            `API Failure: ${method} ${url} failed with status ${status}. Details: ${message}`
        );

        return Promise.reject(error);
    }
);

/**
 * Fetch all notifications
 */
export async function fetchNotifications() {
    const response = await apiClient.get("/notifications");
    return response.data?.data || [];
}

/**
 * Create a custom local notification
 */
export async function createNotification(type, message) {
    const response = await apiClient.post("/notifications", { type, message });
    return response.data?.data;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data?.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data?.data;
}