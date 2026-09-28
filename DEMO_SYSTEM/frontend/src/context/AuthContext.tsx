import { createContext, useContext } from 'react';
import type { TokenResponse } from '../types';

export interface AuthContextValue {
  user: TokenResponse | null;
  rol: string;
  nombre: string;
  esAdmin: boolean;
  esOperador: boolean;
  login: (identificador: string, password: string) => Promise<TokenResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
};