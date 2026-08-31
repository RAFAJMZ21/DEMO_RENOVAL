import api from './axios';
import type { UserLoginPayload, UserRegisterPayload, TokenResponse } from '../types';

export const loginUser = async (data: UserLoginPayload): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('v1/auth/login/', data);
  return response.data;
};

export const registerUser = async (data: UserRegisterPayload) => {
  const response = await api.post('v1/auth/registro/', data);
  return response.data;
};