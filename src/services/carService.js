// src/services/carService.js
import api from "./api";

export const carService = {
  // Create a new car
  create: async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key === "images" && Array.isArray(data[key])) {
        data[key].forEach((file) => {
          formData.append("images", file);
        });
      } else if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        formData.append(key, data[key].toString());
      }
    });

    const response = await api.post("/cars", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all cars with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get("/cars", { params });
    return response.data;
  },

  // Get a single car by ID
  getById: async (id) => {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  },

  // Update a car
  //
  // FIX: the old version skipped any field whose value was "" — which
  // meant clearing a field (or any field that legitimately resolves to an
  // empty string) never made it into the request at all, so the backend
  // had no way to update/clear it. On update we now send every field that
  // isn't undefined/null (including ""), so the backend receives the
  // user's actual intent instead of silently omitting it.
  update: async (id, data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key === "images" && Array.isArray(data[key])) {
        data[key].forEach((file) => {
          formData.append("images", file);
        });
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key].toString());
      }
    });

    const response = await api.put(`/cars/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete a car
  delete: async (id) => {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  },

  // Get car statistics
  getStats: async () => {
    const response = await api.get("/cars/stats");
    return response.data;
  },

  // Search cars by user
  searchByUser: async (query) => {
    const response = await api.get("/cars/search/user", { params: { query } });
    return response.data;
  },
};

export default carService;
