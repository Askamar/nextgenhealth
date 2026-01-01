import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { loginAPI, loginWithPasswordAPI, registerAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, role: Role) => {
    setLoading(true);
    try {
      const userData = await loginAPI(email, role);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error(error);
      alert("Login Failed: Use demo credentials (see login page)");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const userData = await loginWithPasswordAPI(identifier, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Login Failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Partial<User>) => {
    setLoading(true);
    try {
      const newUser = await registerAPI(data);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithPassword, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};