import axios, { AxiosError } from 'axios';
import { User } from '../context/AuthContext';

// ✅ Updated to point to your live backend on Render
const API_BASE_URL = 'https://gloweazy-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string }>;
  return err.response?.data?.message || err.message || 'Request failed';
}

type LoginPayload = { email: string; password: string };
type SignupPayload = { email: string; password: string; role: 'client' | 'stylist' };

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<User>('/auth/login', payload);
  return data;
}

export async function signup(payload: SignupPayload): Promise<User> {
  const { data } = await api.post<User>('/auth/signup', payload);
  return data;
}
