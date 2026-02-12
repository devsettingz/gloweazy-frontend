// frontend/utils/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

let logoutHandler: (() => void) | null = null;
export const setLogoutHandler = (fn: () => void) => {
  logoutHandler = fn;
};

const api = axios.create({
  baseURL: "https://gloweazy-backend.onrender.com",
  timeout: 15000,
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
export const getWallet = async (userId: string) => {
  const res = await api.get(`/wallet/${userId}`);
  const data = res.data.wallet ?? res.data;
  return data as { balance: number; transactions: WalletTransaction[] };
};

export const topupWallet = async (payload: { userId: string; amount: number; method: "card" | "mobile_money" }) => {
  const res = await api.post("/wallet/topup", payload);
  return res.data;
};

export const confirmTopup = async (payload: { userId: string; reference: string }) => {
  const res = await api.post("/wallet/confirm", payload);
  return res.data;
};

export const debitWallet = async (payload: { userId: string; amount: number; bookingId: string }) => {
  const res = await api.post("/wallet/debit", payload);
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
export const getTransactions = async (userId: string) => {
  const res = await api.get(`/transactions/${userId}`);
  const data = res.data.transactions ?? res.data;
  return data as WalletTransaction[];
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
