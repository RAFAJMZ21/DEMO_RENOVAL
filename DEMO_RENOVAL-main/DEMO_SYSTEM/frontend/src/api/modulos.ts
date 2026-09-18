import api from './axios';
import type { 
  LoteProduccionGantt, 
  EstadoCuentaCliente, 
  InventarioAlmacen,
  InsumoClavado,
  ControlMerma,
  EmbarqueDespacho,
  CertificadoFitosanitario
} from '../types';

export interface FleteTarifa {
  estado: string;
  municipio: string;
  km: number;
  precio_flete: number;
  capacidad: number;
  costo_tarima_unitario: number;
}

export const getProduccionGantt = async (): Promise<LoteProduccionGantt[]> => {
  const response = await api.get<LoteProduccionGantt[]>('v1/produccion/gantt/');
  return response.data;
};

export const getEstadoCuenta = async (clienteId: number): Promise<EstadoCuentaCliente> => {
  const response = await api.get<EstadoCuentaCliente>(`v1/clientes/${clienteId}/estado-cuenta/`);
  return response.data;
};

export const getInventarioAlmacen = async (): Promise<InventarioAlmacen> => {
  const response = await api.get<InventarioAlmacen>('v1/almacen/inventario-materia-prima/');
  return response.data;
};

export const getInsumosClavado = async (): Promise<InsumoClavado[]> => {
  const response = await api.get<InsumoClavado[]>('v1/almacen/insumos-clavado/');
  return response.data;
};

export const getControlMermas = async (): Promise<ControlMerma[]> => {
  const response = await api.get<ControlMerma[]>('v1/produccion/mermas-scrap/');
  return response.data;
};

export const getEmbarquesDespacho = async (): Promise<EmbarqueDespacho[]> => {
  const response = await api.get<EmbarqueDespacho[]>('v1/logistica/embarques/');
  return response.data;
};

export const getCertificadosFitosanitarios = async (): Promise<CertificadoFitosanitario[]> => {
  const response = await api.get<CertificadoFitosanitario[]>('v1/fitosanitario/certificados/');
  return response.data;
};

export const getFletesDestino = async (): Promise<FleteTarifa[]> => {
  const response = await api.get<FleteTarifa[]>('v1/logistica/fletes-destino/');
  return response.data;
};