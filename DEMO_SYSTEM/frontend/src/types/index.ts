export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  rol: 'ADMIN' | 'OPERADOR' | 'CLIENTE' | 'OPERADOR_PLANTA' | 'ALMACENISTA' | 'PROVEEDOR';
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_info: {
    email: string;
    nombre: string;
    rol: string;
    area: string;
  };
}

export interface ElementoMadera {
  nombre_elemento: string;
  ancho_in: number;
  grueso_in: number;
  largo_in: number;
  piezas_por_tarima: number;
  precio_pie_tabla: number;
}

export interface CotizacionPayload {
  cliente_id: number;
  atencion: string;
  nombre_producto: string;
  cantidad_piezas: number;
  precio_sugerido_unidad: number;
  costo_estufa_ht: number;
  costo_saque: number;
  costo_cepillado: number;
  costo_transporte: number;
  elementos: ElementoMadera[];
}

export type EstadoCotizacion = 'Borrador' | 'Aprobada' | 'Rechazada';

export interface ItemCotizacion {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CotizacionCreate {
  cliente: string;
  items: ItemCotizacion[];
  dimensiones: string;
  tipo_madera: string;
  precio_unitario: number;
  cantidad: number;
  costo_mano_obra: number;
  flete: number;
}

export interface CotizacionResumen {
  id: number;
  folio: string;
  cliente: string;
  tipo_madera: string;
  dimensiones: string;
  cantidad: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoCotizacion;
  created_at: string;
}

export interface Cotizacion extends CotizacionCreate {
  id: number;
  folio: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoCotizacion;
  created_at: string;
}

export interface LoteProduccionGantt {
  id: number;
  folio_lote: string;
  producto: string;
  piezas_totales: number;
  piezas_completadas: number;
  etapa_actual: 'ASERRADERO' | 'ARMADO' | 'HT_FITOSANITARIO' | 'EMBARQUE';
  fecha_inicio: string;
  fecha_fin_estimada: string;
  porcentaje_avance: number;
  area_asignada: string;
}

export interface EstadoCuentaCliente {
  cliente_id: number;
  razon_social: string;
  limite_credito: number;
  credito_utilizado: number;
  credito_disponible: number;
  anticipos_registrados: number;
  saldo_pendiente: number;
  historial_pedidos: {
    pedido_id: string;
    fecha: string;
    total: number;
    estatus: string;
  }[];
}

export interface InventarioAlmacen {
  area: string;
  insumos: {
    item: string;
    existencia: string;
    proveedor: string;
  }[];
}

export interface DashboardMetrics {
  tarimas_producidas: number;
  lotes_completados: number;
  utilidad_promedio_pct: number;
  utilidad_promedio_monto: number;
  top_modelos: {
    nombre: string;
    unidades: number;
  }[];
  ht_en_proceso_lotes: number;
  ht_en_proceso_piezas: number;
  certificados_liberados: number;
}

export interface InsumoClavado {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: 'CLAVO_ESPIRAL' | 'GRAPA' | 'ESQUINERO' | 'PINTURA';
  medida: string;
  existencia_kg: number;
  stock_minimo_kg: number;
  linea_asignada: string;
}

export interface ControlMerma {
  id: number;
  folio_lote: string;
  pt_teoricos: number;
  pt_reales_utilizados: number;
  pt_desperdicio: number;
  porcentaje_scrap: number;
  causa_principal: string;
}

export interface EmbarqueDespacho {
  id: number;
  folio_embarque: string;
  cliente: string;
  chofer: string;
  placas_trailer: string;
  tarimas_cargadas: number;
  fecha_despacho: string;
  estatus: 'PROGRAMADO' | 'EN_TRANSITO' | 'ENTREGADO';
}

export interface CertificadoFitosanitario {
  id: number;
  folio_certificado: string;
  folio_lote: string;
  cliente: string;
  codigo_sello_ht: string;
  temperatura_alcanzada: number;
  tiempo_sostenimiento_min: number;
  fecha_emision: string;
}

export interface FleteTarifa {
  id: number;
  estado: string;
  municipio: string;
  empresa: string;
  kilometros: number;
  precio_flete: number;
  costo_km: number;
  capacidad_tarimas: number;
  precio_unitario: number;
  precio_reducido: number;
}

export type EstadoViaje = 'Pendiente' | 'En Tránsito' | 'Completado' | 'Rechazado';

export interface ViajeLogisticaCreate {
  folio_cotizacion_id?: number | null;
  tarifa_id: number;
  operador_id?: number | null;
  unidad: string;
  cantidad_tarimas: number;
  fecha_salida?: string;
}

export interface ViajeLogisticaDetalle {
  id: number;
  folio_cotizacion_id: number | null;
  folio_cotizacion: string;
  tarifa_id: number;
  operador_id: number | null;
  operador_nombre: string;
  unidad: string;
  cantidad_tarimas: number;
  costo_total_flete: number;
  estado: EstadoViaje;
  fecha_salida: string;
  destino: string;
  estado_tarifa: string;
  municipio: string;
  empresa: string;
  kilometros: number;
  costo_km: number;
  precio_flete: number;
  capacidad_tarimas: number;
  precio_unitario: number;
  precio_reducido: number;
  created_at?: string;
}