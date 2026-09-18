import api from './axios';
import type { CotizacionPayload } from '../types';

export const calcularCotizacion = async (data: CotizacionPayload) => {
  const response = await api.post('v1/cotizaciones/calcular', data);
  return response.data;
};