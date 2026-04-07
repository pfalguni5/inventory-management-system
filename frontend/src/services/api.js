import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("businessId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if(businessId){
      config.headers["X-Business-Id"] = businessId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;