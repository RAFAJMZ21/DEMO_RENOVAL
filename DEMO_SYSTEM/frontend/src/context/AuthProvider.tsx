import React, { useCallback, useMemo, useState } from 'react';
import type { TokenResponse } from '../types';
import { AuthContext, DEMO_ADMIN_USER, type AuthContextValue, type AuthUser } from './auth';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'renoval_user';
const DEMO_KEY = 'renoval_demo_mode';

const leerUsuarioInicial = (): AuthUser | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const guardado = localStorage.getItem(USER_KEY);
    if (guardado) {
      return JSON.parse(guardado) as AuthUser;
    }
    // Token presente (aunque sea de una sesión previa) o modo demo activo.
    if (token || localStorage.getItem(DEMO_KEY) === '1') {
      return DEMO_ADMIN_USER;
    }
  } catch {
    return DEMO_ADMIN_USER;
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => leerUsuarioInicial());
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEMO_KEY) === '1';
    } catch {
      return false;
    }
  });

  const login = useCallback((data: TokenResponse) => {
    try {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.removeItem(DEMO_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
    const siguiente: AuthUser = {
      id: 1,
      username: data.user_info.email.split('@')[0] || 'admin',
      role: data.user_info.rol,
      nombre: data.user_info.nombre,
      email: data.user_info.email,
    };
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(siguiente));
    } catch {
      /* almacenamiento no disponible */
    }
    setIsDemo(false);
    setUser(siguiente);
  }, []);

  const loginDemo = useCallback(() => {
    try {
      localStorage.setItem(TOKEN_KEY, 'demo_token_renoval_2026');
      localStorage.setItem(DEMO_KEY, '1');
      localStorage.setItem(USER_KEY, JSON.stringify(DEMO_ADMIN_USER));
    } catch {
      /* almacenamiento no disponible */
    }
    setIsDemo(true);
    setUser(DEMO_ADMIN_USER);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DEMO_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
    setIsDemo(false);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isDemo, login, loginDemo, logout }),
    [user, isDemo, login, loginDemo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
