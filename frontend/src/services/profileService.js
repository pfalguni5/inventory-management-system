import api from "./api";

//add userId from JWT
const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if(!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub;
    } catch(e) {
        return null;
    }
};

//get profile
export const getProfile = async () => {
    const userId = getUserIdFromToken();
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

//update profile
export const updateProfile = async (profileData) => {
    const userId = getUserIdFromToken();
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
};

//change password
export const changePassword = async (passwordData) => {
    const userId = getUserIdFromToken();
    const response = await api.put(
        `/users/${userId}/change-password`, passwordData
    );
    return response.data;
}