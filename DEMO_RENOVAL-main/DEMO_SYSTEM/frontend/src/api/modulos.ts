import api from './axios';
import type { 
  LoteProduccionGantt, 
  EstadoCuentaCliente, 
  InventarioAlmacen,
  InsumoClavado,
  ControlMerma,
  EmbarqueDespacho,
  CertificadoFitosanitario,
  ClienteSchema,
  FichaNormativa,
  UserRegisterPayload,
  Usuario
} from '../types';

export interface FleteTarifa {
  id?: number;
  estado: string;
  municipio: string;
  km: number;
  precio_flete: number;
  capacidad: number;
  costo_tarima_unitario: number;
  activo?: boolean;
}

export interface LoteCreate {
  folio_lote: string;
  producto: string;
  piezas_totales: number;
  piezas_completadas?: number;
  etapa_actual?: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  area_asignada: string;
}

export interface EmbarqueCreate {
  folio_embarque: string;
  cliente: string;
  chofer: string;
  placas_trailer: string;
  tarimas_cargadas: number;
  fecha_despacho: string;
  estatus?: string;
}

export interface CertificadoCreate {
  folio_certificado: string;
  folio_lote: string;
  cliente: string;
  codigo_sello_ht: string;
  temperatura_alcanzada: number;
  tiempo_sostenimiento_min: number;
  fecha_emision: string;
}

export interface InsumoCreate {
  codigo: string;
  descripcion: string;
  tipo: string;
  medida: string;
  existencia_kg: number;
  stock_minimo_kg: number;
  linea_asignada: string;
}

export interface ClienteCreate {
  razon_social: string;
  rfc: string;
  limite_credito: number;
  credito_utilizado: number;
  anticipos_registrados: number;
}

export interface MermaCreate {
  folio_lote: string;
  pt_teoricos: number;
  pt_reales_utilizados: number;
  pt_desperdicio: number;
  porcentaje_scrap: number;
  causa_principal: string;
}

export interface FichaNormativaCreate {
  titulo: string;
  norma: string;
  capacidad: string;
  madera: string;
  descripcion?: string;
  archivo_pdf?: string;
}

// --- READ ---
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

export const getInsumosClavado = async (): Promise<InsumoClavado[]> => {
  const response = await api.get<InsumoClavado[]>('v1/almacen/insumos-clavado');
  return response.data;
};

export const getControlMermas = async (): Promise<ControlMerma[]> => {
  const response = await api.get<ControlMerma[]>('v1/produccion/mermas-scrap');
  return response.data;
};

export const getEmbarquesDespacho = async (): Promise<EmbarqueDespacho[]> => {
  const response = await api.get<EmbarqueDespacho[]>('v1/logistica/embarques');
  return response.data;
};

export const getCertificadosFitosanitarios = async (): Promise<CertificadoFitosanitario[]> => {
  const response = await api.get<CertificadoFitosanitario[]>('v1/fitosanitario/certificados');
  return response.data;
};

export const getFletesDestino = async (): Promise<FleteTarifa[]> => {
  const response = await api.get<FleteTarifa[]>('v1/logistica/fletes-destino');
  return response.data;
};

export const getClientes = async (): Promise<ClienteSchema[]> => {
  const response = await api.get<ClienteSchema[]>('v1/clientes/');
  return response.data;
};

export const getFichasNormativas = async (): Promise<FichaNormativa[]> => {
  const response = await api.get<FichaNormativa[]>('v1/fichas-normativas');
  return response.data;
};

export const getDashboardMetrics = async () => {
  const response = await api.get('v1/dashboard/metrics');
  return response.data;
};

// --- CREATE ---
export const createLote = async (data: LoteCreate) => {
  const response = await api.post('v1/produccion/gantt', data);
  return response.data;
};

export const createEmbarque = async (data: EmbarqueCreate) => {
  const response = await api.post('v1/logistica/embarques', data);
  return response.data;
};

export const createCertificado = async (data: CertificadoCreate) => {
  const response = await api.post('v1/fitosanitario/certificados', data);
  return response.data;
};

export const createInsumo = async (data: InsumoCreate) => {
  const response = await api.post('v1/almacen/insumos-clavado', data);
  return response.data;
};

export const createCliente = async (data: ClienteCreate) => {
  const response = await api.post('v1/clientes/', data);
  return response.data;
};

export const createFlete = async (data: FleteTarifa) => {
  const response = await api.post('v1/logistica/fletes-destino', data);
  return response.data;
};

export const createMerma = async (data: MermaCreate) => {
  const response = await api.post('v1/produccion/mermas-scrap', data);
  return response.data;
};

export const createFichaNormativa = async (data: FichaNormativaCreate) => {
  const response = await api.post('v1/fichas-normativas/', data);
  return response.data;
};

export const updateFichaNormativa = async (id: number, data: FichaNormativaCreate) => {
  const response = await api.put(`v1/fichas-normativas/${id}`, data);
  return response.data;
};

export const deleteFichaNormativa = async (id: number) => {
  await api.delete(`v1/fichas-normativas/${id}`);
};

// --- UPDATE ---
export const updateLote = async (id: number, data: LoteCreate) => {
  const response = await api.put(`v1/produccion/gantt/${id}`, data);
  return response.data;
};

export const updateEmbarque = async (id: number, data: EmbarqueCreate) => {
  const response = await api.put(`v1/logistica/embarques/${id}`, data);
  return response.data;
};

export const updateInsumo = async (id: number, data: InsumoCreate) => {
  const response = await api.put(`v1/almacen/insumos-clavado/${id}`, data);
  return response.data;
};

export const updateCliente = async (id: number, data: ClienteCreate) => {
  const response = await api.put(`v1/clientes/${id}`, data);
  return response.data;
};

export const updateFlete = async (id: number, data: FleteTarifa) => {
  const response = await api.put(`v1/logistica/fletes-destino/${id}`, data);
  return response.data;
};

// --- DELETE ---
export const deleteLote = async (id: number) => {
  await api.delete(`v1/produccion/gantt/${id}`);
};

export const deleteEmbarque = async (id: number) => {
  await api.delete(`v1/logistica/embarques/${id}`);
};

export const deleteInsumo = async (id: number) => {
  await api.delete(`v1/almacen/insumos-clavado/${id}`);
};

export const deleteCliente = async (id: number) => {
  await api.delete(`v1/clientes/${id}`);
};

export const deleteFlete = async (id: number) => {
  await api.delete(`v1/logistica/fletes-destino/${id}`);
};

export const deleteMerma = async (id: number) => {
  await api.delete(`v1/produccion/mermas-scrap/${id}`);
};

// --- PDF ---
export const downloadCertificadoPDF = async (folio: string): Promise<Blob> => {
  const response = await api.get(`v1/fitosanitario/certificados/${folio}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

// --- USUARIOS CRUD ---
export interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  rol: string;
  created_at: string;
}

export const getUsuarios = async (): Promise<UsuarioResponse[]> => {
  const response = await api.get<UsuarioResponse[]>('v1/auth/usuarios');
  return response.data;
};

export const createUsuario = async (data: UserRegisterPayload) => {
  const response = await api.post('v1/auth/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: Partial<UserRegisterPayload>) => {
  const response = await api.put(`v1/auth/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number) => {
  await api.delete(`v1/auth/usuarios/${id}`);
};

export const getRoles = async (): Promise<string[]> => {
  return ['ADMIN', 'OPERADOR', 'ALMACENISTA', 'CLIENTE', 'PROVEEDOR'];
};

// --- CLIENTES CRUD ---
export interface ClienteResponse {
  id: number;
  razon_social: string;
  rfc: string;
  limite_credito: number;
  credito_utilizado: number;
  anticipos_registrados: number;
  created_at: string;
}

export const createCliente = async (data: ClienteCreate) => {
  const response = await api.post('v1/clientes/', data);
  return response.data;
};

export const updateCliente = async (id: number, data: ClienteCreate) => {
  const response = await api.put(`v1/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id: number) => {
  await api.delete(`v1/clientes/${id}`);
};

// --- ENTRADA MADERA ---
export interface EntradaMaderaCreate {
  tipo: 'VERDE' | 'ESTUFADA';
  metros_cubicos: number;
  proveedor: string;
  fecha: string;
  observaciones?: string;
}

export interface EntradaMaderaResponse {
  id: number;
  tipo: string;
  metros_cubicos: number;
  proveedor: string;
  fecha: string;
  observaciones?: string;
  created_at: string;
}

export const createEntradaMadera = async (data: EntradaMaderaCreate) => {
  const response = await api.post('v1/almacen/entradas-madera', data);
  return response.data;
};

export const getEntradasMadera = async (): Promise<EntradaMaderaResponse[]> => {
  const response = await api.get<EntradaMaderaResponse[]>('v1/almacen/entradas-madera');
  return response.data;
};