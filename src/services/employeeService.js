// src/services/employeeService.js
//
// FIX: this used to call the backend directly with raw fetch(), which meant
// employee/salary requests never got the Authorization header and never
// reacted to 401s. It now goes through the shared `api` axios instance
// (services/api.js), which attaches the JWT to every request and handles
// 401s (clears the token, redirects to login) in one place.
import api from "./api";

class EmployeeService {
  constructor() {
    // Paths only now - `api` already carries the base URL (incl. /api).
    this.baseURL = "/employees";
    this.salaryBaseURL = "/salaries";
  }

  // Helper method for API requests
  async request(endpoint, options = {}, basePath = null) {
    const url = `${basePath || this.baseURL}${endpoint}`;
    const method = (options.method || "GET").toLowerCase();

    try {
      const response = await api.request({
        url,
        method,
        data: options.body ? JSON.parse(options.body) : undefined,
        headers: options.headers,
      });

      return response.data;
    } catch (error) {
      // Preserve the old "throw new Error(message)" shape callers expect,
      // while pulling the message out of the axios error (or the 401
      // redirect that services/api.js already triggered).
      const message = error.response?.data?.message || error.message || "Something went wrong";
      console.error("Employee Service Error:", message);
      throw new Error(message);
    }
  }

  // ==================== EMPLOYEE ENDPOINTS ====================

  // Get all employees with optional filters
  async getAllEmployees(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.role && filters.role !== "All") queryParams.append("role", filters.role);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";

    const response = await this.request(endpoint);
    return response.data || [];
  }

  // Get single employee by ID
  async getEmployeeById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  // Create new employee
  async createEmployee(employeeData) {
    const response = await this.request("", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
    return response.data;
  }

  // Update employee
  async updateEmployee(id, employeeData) {
    const response = await this.request(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    });
    return response.data;
  }

  // Delete employee
  async deleteEmployee(id) {
    const response = await this.request(`/${id}`, {
      method: "DELETE",
    });
    return response.data;
  }

  // Get employee statistics
  async getEmployeeStats() {
    const response = await this.request("/stats");
    return response.data;
  }

  // Search employees
  async searchEmployees(query) {
    const response = await this.request(`/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  }

  // Get employees by role
  async getEmployeesByRole(role) {
    const response = await this.request(`/role/${encodeURIComponent(role)}`);
    return response.data || [];
  }

  // ==================== SALARY ENDPOINTS ====================

  // Get all salary payments with filters
  async getAllSalaries(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.employeeId) queryParams.append("employeeId", filters.employeeId);
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.method) queryParams.append("method", filters.method);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.paymentType) queryParams.append("paymentType", filters.paymentType);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";

    const response = await this.request(endpoint, {}, this.salaryBaseURL);
    return response.data || [];
  }

  // Get single salary payment by ID
  async getSalaryById(id) {
    const response = await this.request(`/${id}`, {}, this.salaryBaseURL);
    return response.data;
  }

  // Create new salary payment
  async createSalaryPayment(paymentData) {
    const response = await this.request(
      "",
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      },
      this.salaryBaseURL,
    );
    return response.data;
  }

  // Update salary payment
  async updateSalaryPayment(id, paymentData) {
    const response = await this.request(
      `/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(paymentData),
      },
      this.salaryBaseURL,
    );
    return response.data;
  }

  // Delete salary payment
  async deleteSalaryPayment(id) {
    const response = await this.request(
      `/${id}`,
      {
        method: "DELETE",
      },
      this.salaryBaseURL,
    );
    return response.data;
  }

  // Get salary statistics
  async getSalaryStats(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.employeeId) queryParams.append("employeeId", filters.employeeId);
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";

    const response = await this.request(`/stats${endpoint}`, {}, this.salaryBaseURL);
    return response.data;
  }

  // Get salary history for specific employee
  async getEmployeeSalaryHistory(employeeId, limit = 10) {
    const response = await this.request(
      `/employee/${employeeId}?limit=${limit}`,
      {},
      this.salaryBaseURL,
    );
    return response.data || [];
  }

  // Get employee balance - FIXED (removed extra /salaries)
  async getEmployeeBalance(employeeId, month) {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append("month", month);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";

    // FIXED: Removed /salaries from the endpoint since salaryBaseURL already includes it
    const response = await this.request(
      `/balance/${employeeId}${endpoint}`,
      {},
      this.salaryBaseURL,
    );
    return response.data;
  }

  // Record salary payment (convenience method - uses the new salary endpoint)
  async recordSalaryPayment(employeeId, paymentData) {
    const paymentPayload = {
      employeeId: employeeId,
      payment: paymentData.payment || paymentData.amount,
      month: paymentData.month,
      paidDate: paymentData.paidDate,
      method: paymentData.method || "Cash",
      paymentType: paymentData.paymentType || "Full Salary",
      notes: paymentData.notes || "",
      isPartial: paymentData.isPartial || false,
      isAdvance: paymentData.isAdvance || false,
    };

    const response = await this.request(
      "",
      {
        method: "POST",
        body: JSON.stringify(paymentPayload),
      },
      this.salaryBaseURL,
    );
    return response.data;
  }

  // Get salary history for employee (alias for backward compatibility)
  async getSalaryHistory(employeeId, limit = 10) {
    return this.getEmployeeSalaryHistory(employeeId, limit);
  }

  // Check if salary is already paid for a specific month
  async checkSalaryPaid(employeeId, month) {
    const salaries = await this.getAllSalaries({
      employeeId: employeeId,
      month: month,
      status: "Paid",
    });
    return salaries.length > 0;
  }

  // Get total salary paid for an employee
  async getEmployeeTotalPaid(employeeId) {
    const stats = await this.getSalaryStats({ employeeId });
    const employeeStats = stats.stats?.find((s) => s.employeeId === employeeId);
    return employeeStats?.totalPaid || 0;
  }
}

// Create and export a singleton instance
export const employeeService = new EmployeeService();
export default employeeService;
