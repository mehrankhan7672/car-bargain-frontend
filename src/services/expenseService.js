// src/services/expenseService.js
import api from "./api";

export const expenseService = {
  create: async (data) => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/expenses/stats");
    return response.data;
  },
};

export default expenseService;
