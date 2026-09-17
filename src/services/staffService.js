// src/services/staffService.js
import api from "./api";

export const staffService = {
  // Get all staff for the logged-in owner/tenant
  // Backend returns: { success: true, count: number, staff: [...] }
  getAll: async () => {
    const response = await api.get("/auth/staff");
    return response.data; // Returns { success, count, staff }
  },

  // Create a new staff member
  // Payload: { name, email, password, role }
  // Backend returns: { success: true, message, user }
  create: async (data) => {
    const response = await api.post("/auth/staff", data);
    return response.data;
  },

  // Update staff details and/or permissions
  // Payload: { name?, email?, role?, permissions: { cars: { view, add, edit, delete }, ... } }
  // Backend returns: { success: true, message, user }
  update: async (id, data) => {
    const response = await api.put(`/auth/staff/${id}`, data);
    return response.data;
  },

  // Activate/deactivate a staff member
  // Backend returns: { success: true, message, user }
  setStatus: async (id, isActive) => {
    const response = await api.patch(`/auth/staff/${id}/status`, { isActive });
    return response.data;
  },

  // Delete a staff member
  // Backend returns: { success: true, message }
  remove: async (id) => {
    const response = await api.delete(`/auth/staff/${id}`);
    return response.data;
  },
};

export default staffService;
