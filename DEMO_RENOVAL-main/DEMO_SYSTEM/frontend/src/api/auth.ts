import api from './axios';
import type { UserLoginPayload, UserRegisterPayload, TokenResponse, ModuleConfig } from '../types';

export const loginUser = async (data: UserLoginPayload): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('v1/auth/login', data);
  return response.data;
};

export const registerUser = async (data: UserRegisterPayload) => {
  const response = await api.post('v1/auth/registro', data);
  return response.data;
};

export const getUserModules = async (): Promise<ModuleConfig[]> => {
  const response = await api.get<ModuleConfig[]>('v1/auth/me/modules');
  return response.data;
};

export const getCurrentUser = async (): Promise<TokenResponse['user_info']> => {
  const response = await api.get('v1/auth/me');
  return response.data;
};