import axios from "axios";

const api = axios.create({
  baseURL: `https://projectmanagement-portal-production.up.railway.app/api`,
});

// Intercept requests to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
