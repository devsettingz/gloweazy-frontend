import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { setLogoutHandler } from '../utils/api';

// ✅ Define reusable role type
export type UserRole = 'client' | 'stylist' | 'admin';

// ✅ Extended User type to include name, bio, avatarUrl, lastLogin, and lastActivity
export type User = {
  id: string;
  email: string;
  role: UserRole; // ✅ now includes "admin"
  name?: string;
  bio?: string;
  avatarUrl?: string;
  lastLogin?: string;
  lastActivity?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateActivity: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('authUser');
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedUser) setUser(JSON.parse(storedUser) as User);
        if (storedToken) setToken(storedToken);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();

    // ✅ Register logout handler with axios
    setLogoutHandler(logout);
  }, []);

  const login = async (u: User, t: string) => {
    // ✅ Add lastLogin timestamp when user logs in
    const userWithLogin = { ...u, lastLogin: new Date().toISOString() };
    await AsyncStorage.setItem('authUser', JSON.stringify(userWithLogin));
    await AsyncStorage.setItem('authToken', t);
    setUser(userWithLogin);
    setToken(t);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authUser');
    await AsyncStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  // ✅ Update lastActivity whenever user performs an action
  const updateActivity = async () => {
    if (user) {
      const updatedUser = { ...user, lastActivity: new Date().toISOString() };
      await AsyncStorage.setItem('authUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateActivity, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
