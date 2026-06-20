import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import { loginAPI, registerAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, role: Role) => {
    setLoading(true);
    try {
      const userData = await loginAPI(email, password, role);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
    } catch (error) {
      console.error(error);
      alert("Login Failed: Use demo credentials (see login page)");
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
      if (newUser.token) {
        localStorage.setItem('token', newUser.token);
      }
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
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};