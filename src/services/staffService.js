// src/services/staffService.js
import api from "./api";

export const staffService = {
  getAll: async () => {
    const response = await api.get("/auth/users");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/auth/staff", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/auth/staff/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/auth/staff/${id}`);
    return response.data;
  },
};

export default staffService;
