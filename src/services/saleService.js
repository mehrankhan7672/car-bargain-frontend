// src/services/saleService.js
import api from "./api";

export const saleService = {
  create: async (data) => {
    const response = await api.post("/sales", data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get("/sales", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/sales/stats");
    return response.data;
  },
  addPayment: async (saleId, data) => {
    const response = await api.post(`/sales/${saleId}/payments`, data);
    return response.data;
  },
};

export default saleService;
