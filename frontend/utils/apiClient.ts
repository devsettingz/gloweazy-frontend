import axios from "axios";
import { getToken, removeToken } from "./authStorage";

const api = axios.create({
  baseURL: "https://your-backend.onrender.com/api", // replace with your Render backend URL
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens (auto logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      // Optionally redirect to login screen here
      console.warn("Token expired — user logged out");
    }
    return Promise.reject(error);
  }
);

export default api;
