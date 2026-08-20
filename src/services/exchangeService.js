// src/services/exchangeService.js
import api from "./api";

export const exchangeService = {
  // Create a new exchange deal
  create: async (data) => {
    const response = await api.post("/exchanges", data);
    return response.data;
  },

  // Get all exchange deals with pagination/search/filter
  getAll: async (params = {}) => {
    const response = await api.get("/exchanges", { params });
    return response.data;
  },

  // Get a single exchange deal by ID
  getById: async (id) => {
    const response = await api.get(`/exchanges/${id}`);
    return response.data;
  },

  // Update an exchange deal
  update: async (id, data) => {
    const response = await api.put(`/exchanges/${id}`, data);
    return response.data;
  },

  // Delete an exchange deal
  delete: async (id) => {
    const response = await api.delete(`/exchanges/${id}`);
    return response.data;
  },

  // Record a payment against an exchange
  recordPayment: async (id, data) => {
    const response = await api.put(`/exchanges/${id}/payment`, data);
    return response.data;
  },

  // Exchange statistics (totals, breakdown by type)
  getStats: async () => {
    const response = await api.get("/exchanges/stats");
    return response.data;
  },
};

export default exchangeService;