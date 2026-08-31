import api from './axios';
import type { LoteProduccionGantt, EstadoCuentaCliente, InventarioAlmacen } from '../types';

export const getProduccionGantt = async (): Promise<LoteProduccionGantt[]> => {
  const response = await api.get<LoteProduccionGantt[]>('v1/produccion/gantt');
  return response.data;
};

export const getEstadoCuenta = async (clienteId: number): Promise<EstadoCuentaCliente> => {
  const response = await api.get<EstadoCuentaCliente>(`v1/clientes/${clienteId}/estado-cuenta`);
  return response.data;
};

export const getInventarioAlmacen = async (): Promise<InventarioAlmacen> => {
  const response = await api.get<InventarioAlmacen>('v1/almacen/inventario-materia-prima');
  return response.data;
};