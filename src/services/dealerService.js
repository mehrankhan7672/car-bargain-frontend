import api from "./api";

export const dealerService = {
  create: async (data) => {
    try {
      const response = await api.post("/dealers", data);
      return response.data;
    } catch (error) {
      console.error("Create dealer error:", error);
      throw error;
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await api.get("/dealers", { params });
      return response.data;
    } catch (error) {
      console.error("Get dealers error:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/dealers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get dealer by ID error:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/dealers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update dealer error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/dealers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete dealer error:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/dealers/stats");
      return response.data;
    } catch (error) {
      console.error("Get dealer stats error:", error);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const response = await api.get("/dealers/search", { params: { query } });
      return response.data;
    } catch (error) {
      console.error("Search dealers error:", error);
      throw error;
    }
  },
};

export default dealerService;
