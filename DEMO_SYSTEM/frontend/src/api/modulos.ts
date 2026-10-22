import api from './axios';
import type { 
  LoteProduccionGantt, 
  EstadoCuentaCliente, 
  InsumoClavado,
  ControlMerma,
  CertificadoFitosanitario,
  DestinoFlete
} from '../types';

export const getProduccionGantt = async (): Promise<LoteProduccionGantt[]> => {
  const response = await api.get<LoteProduccionGantt[]>('v1/produccion/gantt/');
  return response.data;
};

export const getEstadoCuenta = async (clienteId: number): Promise<EstadoCuentaCliente> => {
  const response = await api.get<EstadoCuentaCliente>(`v1/clientes/${clienteId}/estado-cuenta/`);
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

export const getCertificadosFitosanitarios = async (): Promise<CertificadoFitosanitario[]> => {
  const response = await api.get<CertificadoFitosanitario[]>('v1/fitosanitario/certificados/');
  return response.data;
};

export const getFletesDestino = async (): Promise<DestinoFlete[]> => {
  const response = await api.get<DestinoFlete[]>('v1/logistica/fletes-destino/');
  return response.data;
};
