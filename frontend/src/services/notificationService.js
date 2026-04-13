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

const notificationService = { getNotifications };

export default notificationService;