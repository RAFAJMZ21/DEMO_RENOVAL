import api from './axios';
import type { InventarioAlmacen, InventarioTarimasResponse } from '../types';

export const getInventarioMateriaPrima = async (): Promise<InventarioAlmacen> => {
  const response = await api.get<InventarioAlmacen>('v1/almacen/inventario-materia-prima/');
  return response.data;
};

export const getInventarioTarimas = async (): Promise<InventarioTarimasResponse> => {
  const response = await api.get<InventarioTarimasResponse>('v1/inventario/tarimas/');
  return response.data;
};
