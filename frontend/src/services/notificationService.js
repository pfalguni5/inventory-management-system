import api from "./api";

const getNotifications = async () => {
    try {
        const response = await api.get("/notifications");
        return response.data || [];
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
};

const dismissNotification = async (notificationId) => {
    try {
        await api.put(`/notifications/${notificationId}/read`);
        return true;
    } catch (error) {
        console.error("Failed to dismiss notification:", error);
        return false;
    }
};

const notificationService = { getNotifications, dismissNotification };

export default notificationService;