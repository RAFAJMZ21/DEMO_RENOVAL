import { createContext, useContext } from 'react';
import type { TokenResponse } from '../types';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  nombre: string;
  email: string;
}

// Usuario Administrador por defecto para el MODO DEMO (sin backend).
export const DEMO_ADMIN_USER: AuthUser = {
  id: 1,
  username: 'admin',
  role: 'ADMIN',
  nombre: 'Administrador RENOVAL',
  email: 'admin@renoval.com',
};

export interface AuthContextValue {
  user: AuthUser | null;
  isDemo: boolean;
  login: (data: TokenResponse) => void;
  loginDemo: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
};
