// src/services/logService.js
import api from "./api";

export const logService = {
  // Get all logs with pagination/category filter/search
  getAll: async (params = {}) => {
    const response = await api.get("/logs", { params });
    return response.data;
  },

  // Get log counts grouped by category
  getStats: async () => {
    const response = await api.get("/logs/stats");
    return response.data;
  },

  // Delete a single log entry
  delete: async (id) => {
    const response = await api.delete(`/logs/${id}`);
    return response.data;
  },
};

export default logService;
