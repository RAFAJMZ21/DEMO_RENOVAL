export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  rol: 'ADMIN' | 'CLIENTE' | 'OPERADOR_PLANTA' | 'ALMACENISTA' | 'PROVEEDOR';
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