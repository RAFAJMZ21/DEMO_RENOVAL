import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { loginUser } from '../api/auth';
import { AuthContext } from './AuthContext.tsx';
import type { AuthContextValue } from './AuthContext.tsx';
import type { TokenResponse } from '../types';

const STORAGE_KEY = 'renoval_user';
const TOKEN_KEY = 'access_token';

const readStoredUser = (): TokenResponse | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenResponse) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TokenResponse | null>(readStoredUser);

  const login = useCallback(async (identificador: string, password: string) => {
    const res = await loginUser({ email: identificador, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setUser(res);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const rol = user?.user_info?.rol ?? '';
  const nombre = user?.user_info?.nombre ?? '';

  const value: AuthContextValue = {
    user,
    rol,
    nombre,
    esAdmin: rol === 'ADMIN',
    esOperador: rol === 'OPERADOR',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};