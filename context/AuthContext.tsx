import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import { loginAPI, registerAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, role: Role) => {
    setLoading(true);
    try {
      const userData = await loginAPI(email, role);
      setUser(userData);
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
    } catch (error) {
        console.error(error);
        alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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