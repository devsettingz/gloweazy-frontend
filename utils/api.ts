// frontend/utils/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

let logoutHandler: (() => void) | null = null;
export const setLogoutHandler = (fn: () => void) => {
  logoutHandler = fn;
};

const api = axios.create({
  baseURL: "https://gloweazy-backend.onrender.com",
  timeout: 60000, // 60 seconds for Render free tier cold start
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("gloweazy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto‑logout on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && logoutHandler) {
      logoutHandler(); // call AuthContext.logout()
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (payload: { email: string; password: string }) => {
  const res = await api.post("/auth/login", payload);
  // Backend returns: { _id, name, email, role, token }
  return {
    user: { id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role },
    token: res.data.token
  };
};

export const signup = async (payload: { email: string; password: string; role: "client" | "stylist"; name: string }) => {
  const res = await api.post("/auth/signup", payload);
  // Backend returns: { _id, name, email, role, token }
  return {
    user: { id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role },
    token: res.data.token
  };
};

// Wallet
export const getWallet = async () => {
  const res = await api.get("/wallet/balance");
  const data = res.data.wallet ?? res.data;
  return data as { balance: number; currency: string; transactions: WalletTransaction[] };
};

export const topupWallet = async (payload: { amount: number; method: "card" | "mobile_money"; reference?: string }) => {
  const res = await api.post("/wallet/topup", payload);
  return res.data;
};

export const confirmTopup = async (payload: { reference: string }) => {
  const res = await api.post("/wallet/confirm", payload);
  return res.data;
};

export const debitWallet = async (payload: { amount: number; bookingId: string }) => {
  const res = await api.post("/wallet/escrow/hold", payload);
  return res.data;
};

// Payments
export const checkoutPayment = async (payload: {
  bookingId: string;
  method: "card" | "mobile_money" | "cash";
  amount: number;
}) => {
  const res = await api.post("/payments/checkout", payload);
  return res.data;
};

// Transactions
export const getTransactions = async () => {
  const res = await api.get("/wallet/transactions");
  const data = res.data.transactions ?? res.data;
  return data as WalletTransaction[];
};

// Stylists
export const getStylists = async (params?: { specialty?: string; city?: string; search?: string }) => {
  const res = await api.get("/stylists/search", { params });
  return res.data;
};

export const getStylistById = async (id: string) => {
  const res = await api.get(`/stylists/${id}`);
  return res.data;
};

export const getStylistServices = async (id: string) => {
  const res = await api.get(`/stylists/${id}/services`);
  return res.data;
};

// Types
export type WalletTransaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  currency: "GHS" | "USD" | "NGN";
  method: "card" | "mobile_money" | "cash" | "wallet" | "adjustment";
  reference?: string;
  createdAt: string;
  note?: string;
};

export default api;
