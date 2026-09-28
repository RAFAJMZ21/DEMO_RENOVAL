import api from './axios';
import type { CotizacionPayload, CotizacionCreate, Cotizacion, CotizacionResumen, EstadoCotizacion } from '../types';

export const calcularCotizacion = async (data: CotizacionPayload) => {
  const response = await api.post('v1/cotizaciones/calcular', data);
  return response.data;
};

export const crearCotizacion = async (data: CotizacionCreate): Promise<Cotizacion> => {
  const response = await api.post<Cotizacion>('v1/cotizaciones/', data);
  return response.data;
};

export const listarCotizaciones = async (): Promise<CotizacionResumen[]> => {
  const response = await api.get<CotizacionResumen[]>('v1/cotizaciones/');
  return response.data;
};

export const obtenerCotizacion = async (id: number): Promise<Cotizacion> => {
  const response = await api.get<Cotizacion>(`v1/cotizaciones/${id}/`);
  return response.data;
};

export const actualizarEstadoCotizacion = async (
  id: number,
  estado: EstadoCotizacion
): Promise<Cotizacion> => {
  const response = await api.patch<Cotizacion>(`v1/cotizaciones/${id}/estado/`, { estado });
  return response.data;
};