import api from './axios';
import type { FleteTarifa, ViajeLogisticaCreate, ViajeLogisticaDetalle, EstadoViaje } from '../types';

export const listarTarifasFletes = async (): Promise<FleteTarifa[]> => {
  const response = await api.get<FleteTarifa[]>('v1/logistica/tarifas/');
  return response.data;
};

export const crearTarifaFlete = async (data: Omit<FleteTarifa, 'id'>): Promise<FleteTarifa> => {
  const response = await api.post<FleteTarifa>('v1/logistica/tarifas/', data);
  return response.data;
};

export const actualizarTarifaFlete = async (id: number, data: Partial<FleteTarifa>): Promise<FleteTarifa> => {
  const response = await api.patch<FleteTarifa>(`v1/logistica/tarifas/${id}`, data);
  return response.data;
};

export const eliminarTarifaFlete = async (id: number): Promise<void> => {
  await api.delete(`v1/logistica/tarifas/${id}`);
};

export const crearViajeLogistica = async (data: ViajeLogisticaCreate): Promise<ViajeLogisticaDetalle> => {
  const response = await api.post<ViajeLogisticaDetalle>('v1/logistica/viajes/', data);
  return response.data;
};

export const listarViajesLogistica = async (): Promise<ViajeLogisticaDetalle[]> => {
  const response = await api.get<ViajeLogisticaDetalle[]>('v1/logistica/viajes/');
  return response.data;
};

export const listarViajesPendientes = async (): Promise<ViajeLogisticaDetalle[]> => {
  const response = await api.get<ViajeLogisticaDetalle[]>('v1/logistica/viajes/pendientes/');
  return response.data;
};

export const aprobarViaje = async (
  id: number,
  estado: EstadoViaje = 'En Tránsito'
): Promise<ViajeLogisticaDetalle> => {
  const response = await api.patch<ViajeLogisticaDetalle>(`v1/logistica/viajes/${id}/aprobar`, { estado });
  return response.data;
};