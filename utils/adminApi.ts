// Admin API utilities
import api from "./api";

// Dashboard
export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

// User Management
export const getUsers = async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const getUser = async (id: string) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const createUser = async (userData: { name: string; email: string; password: string; role: string; phone?: string }) => {
  const res = await api.post("/admin/users", userData);
  return res.data;
};

export const updateUser = async (id: string, userData: { name?: string; email?: string; phone?: string; role?: string; isActive?: boolean }) => {
  const res = await api.put(`/admin/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  const res = await api.post(`/admin/users/${id}/reset-password`, { newPassword });
  return res.data;
};

// Stylist Management
export const getStylists = async (params?: { approved?: boolean; search?: string; page?: number; limit?: number }) => {
  const res = await api.get("/admin/stylists", { params });
  return res.data;
};

export const approveStylist = async (id: string) => {
  const res = await api.post(`/admin/stylists/${id}/approve`);
  return res.data;
};

export const featureStylist = async (id: string, featured: boolean) => {
  const res = await api.post(`/admin/stylists/${id}/feature`, { featured });
  return res.data;
};

// Booking Management
export const getBookings = async (params?: { status?: string; page?: number; limit?: number }) => {
  const res = await api.get("/admin/bookings", { params });
  return res.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const res = await api.patch(`/admin/bookings/${id}/status`, { status });
  return res.data;
};

// Financial Management
export const getTransactions = async (params?: { type?: string; status?: string; page?: number; limit?: number }) => {
  const res = await api.get("/admin/transactions", { params });
  return res.data;
};

export const getRevenueReport = async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
  const res = await api.get("/admin/revenue", { params });
  return res.data;
};

export const adjustWallet = async (userId: string, amount: number, reason: string) => {
  const res = await api.post("/admin/wallet/adjust", { userId, amount, reason });
  return res.data;
};

// System Settings
export const getSettings = async () => {
  const res = await api.get("/admin/settings");
  return res.data;
};

export const updateSettings = async (settings: any) => {
  const res = await api.put("/admin/settings", settings);
  return res.data;
};

// Communications
export const sendAnnouncement = async (data: { title: string; message: string; target?: string }) => {
  const res = await api.post("/admin/announcements", data);
  return res.data;
};

// Audit Log
export const getAuditLog = async () => {
  const res = await api.get("/admin/audit-log");
  return res.data;
};
