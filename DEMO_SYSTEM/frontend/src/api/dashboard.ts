import api from './axios';
import type { DashboardMetrics } from '../types';

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await api.get<DashboardMetrics>('v1/dashboard/metrics');
  return response.data;
};