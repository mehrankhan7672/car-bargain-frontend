// src/services/api.js
import axios from "axios";

// Get the base URL from environment variables
// Make sure it ends with /api
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Ensure the URL ends with /api
const BASE_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

console.log("🔧 API Base URL:", BASE_URL); // Should show: http://localhost:5000/api

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the full URL
    console.log("📤 Full Request URL:", `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // FIX: this used to clear only the token and redirect to "/login",
      // which isn't a real route in this app (sign-in lives at
      // /auth/signin) and left a stale "user" entry in localStorage.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  },
);

export default api;
