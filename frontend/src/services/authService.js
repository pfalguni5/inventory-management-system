import api from "./api";

//login
export const loginUser = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

//signup
export const registerUser = async (data) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
};

//forgot password
export const forgotPassword = async (data) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
};

//send OTP
export const sendOtp = async (data) => {
    const response = await api.post("/auth/send-otp", data);
    return response.data;
};

//verify OTP
export const verifyOtp = async (data) => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
};

//reset password
export const resetPassword = async (data) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
};