import type {
  CertificadoFitosanitario,
  CotizacionPayload,
  DashboardMetrics,
  DestinoFlete,
  EmbarqueDespacho,
  EstadoViaje,
  FleteTarifa,
  InventarioAlmacen,
  InventarioTarimasResponse,
  InsumoClavado,
  LoteProduccionGantt,
  TokenResponse,
  ViajeLogisticaDetalle,
} from '../types';

export interface MockRequest {
  method: string;
  path: string;
  params: string[];
  body: unknown;
}

export interface MockResponse {
  status: number;
  data: unknown;
}

type MockHandler = (request: MockRequest) => MockResponse;

const ok = (data: unknown): MockResponse => ({ status: 200, data });
const created = (data: unknown): MockResponse => ({ status: 201, data });
const noContent = (): MockResponse => ({ status: 204, data: null });
const notFound = (detail: string): MockResponse => ({ status: 404, data: { detail } });

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value !== '' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const redondear = (value: number, decimales = 2): number => {
  const factor = 10 ** decimales;
  return Math.round(value * factor) / factor;
};

const siguienteId = (items: { id: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const hoyISO = (): string => {
  const fecha = new Date();
  const pad = (valor: number): string => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
};

const folioCotizacion = (): string => {
  const fecha = new Date();
  const pad = (valor: number): string => String(valor).padStart(2, '0');
  return `COT-${fecha.getFullYear()}${pad(fecha.getMonth() + 1)}${pad(fecha.getDate())}${pad(fecha.getHours())}${pad(
    fecha.getMinutes()
  )}${pad(fecha.getSeconds())}`;
};

const ESTADOS_VIAJE: EstadoViaje[] = ['Pendiente', 'En Tránsito', 'Completado', 'Rechazado'];

const completarTarifa = (tarifa: FleteTarifa): FleteTarifa => {
  const costoKm = tarifa.kilometros > 0 ? redondear(tarifa.precio_flete / tarifa.kilometros) : 0;
  const unitario = tarifa.capacidad_tarimas > 0 ? redondear(tarifa.precio_flete / tarifa.capacidad_tarimas) : 0;
  return {
    ...tarifa,
    costo_km: costoKm,
    precio_unitario: unitario,
    precio_reducido: redondear(unitario * 0.95),
  };
};

const construirViaje = (tarifa: FleteTarifa, payload: unknown): ViajeLogisticaDetalle => {
  const body = (payload ?? {}) as Record<string, unknown>;
  const cantidad = Math.max(1, toNumber(body.cantidad_tarimas, 1));
  const unitario = tarifa.precio_unitario > 0 ? tarifa.precio_unitario : redondear(tarifa.precio_flete / tarifa.capacidad_tarimas);
  const reducido = tarifa.precio_reducido > 0 ? tarifa.precio_reducido : redondear(unitario * 0.95);
  const costoTotal =
    cantidad > tarifa.capacidad_tarimas ? redondear(cantidad * reducido) : redondear(cantidad * unitario);

  return {
    id: 0,
    folio_cotizacion: toText(body.folio_cotizacion, 'COT-2026-DEMO'),
    tarifa_id: tarifa.id,
    operador_nombre: 'Operador Demo',
    unidad: toText(body.unidad, 'Tractocamión RENOVAL'),
    cantidad_tarimas: cantidad,
    costo_total_flete: costoTotal,
    estado: 'Pendiente',
    fecha_salida: toText(body.fecha_salida, hoyISO()),
    destino: `${tarifa.municipio}, ${tarifa.estado}`,
    estado_tarifa: tarifa.estado,
    municipio: tarifa.municipio,
    empresa: tarifa.empresa,
    kilometros: tarifa.kilometros,
    costo_km: tarifa.costo_km,
    precio_flete: tarifa.precio_flete,
    capacidad_tarimas: tarifa.capacidad_tarimas,
    precio_unitario: tarifa.precio_unitario,
    precio_reducido: tarifa.precio_reducido,
  };
};

// ------------------------------------------------------------------------------
// Base de datos en memoria del Modo Demo (se conserva mientras dure la sesión)
// ------------------------------------------------------------------------------
const db = {
  metrics: {
    tarimas_producidas: 12450,
    lotes_completados: 3,
    utilidad_promedio_pct: 28.4,
    utilidad_promedio_monto: 48.5,
    top_modelos: [
      { nombre: 'Tarima Barrote 40x48', unidades: 4800 },
      { nombre: 'Tarima Tacón Exportación', unidades: 3200 },
      { nombre: 'Caja de Madera 120x100', unidades: 1450 },
    ],
    ht_en_proceso_lotes: 3,
    ht_en_proceso_piezas: 2400,
    certificados_liberados: 45,
  } as DashboardMetrics,

  lotes: [
    {
      id: 1,
      folio_lote: 'LOT-2026-001',
      orden_produccion: 'OP-2026-0145',
      producto: 'Tarima Barrote 40" x 48" (NOM-144)',
      piezas_totales: 1200,
      piezas_completadas: 850,
      etapa_actual: 'HT_FITOSANITARIO',
      fecha_inicio: '2026-09-14',
      fecha_fin_estimada: '2026-09-19',
      porcentaje_avance: 70.8,
      area_asignada: 'Horno de Estufado HT-01',
    },
    {
      id: 2,
      folio_lote: 'LOT-2026-002',
      orden_produccion: 'OP-2026-0146',
      producto: 'Tarima Tacón Exportación 1200x1000mm',
      piezas_totales: 800,
      piezas_completadas: 320,
      etapa_actual: 'ARMADO',
      fecha_inicio: '2026-09-16',
      fecha_fin_estimada: '2026-09-21',
      porcentaje_avance: 40,
      area_asignada: 'Línea de Clavado B',
    },
    {
      id: 3,
      folio_lote: 'LOT-2026-003',
      orden_produccion: 'OP-2026-0147',
      producto: 'Caja de Madera 120x100 Reforzada',
      piezas_totales: 450,
      piezas_completadas: 450,
      etapa_actual: 'EMBARQUE',
      fecha_inicio: '2026-09-10',
      fecha_fin_estimada: '2026-09-17',
      porcentaje_avance: 100,
      area_asignada: 'Almacén PT',
    },
    {
      id: 4,
      folio_lote: 'LOT-2026-004',
      orden_produccion: 'OP-2026-0148',
      producto: 'Tarima Barrote 40" x 48" (NOM-144)',
      piezas_totales: 1500,
      piezas_completadas: 275,
      etapa_actual: 'ASERRADERO',
      fecha_inicio: '2026-09-18',
      fecha_fin_estimada: '2026-09-24',
      porcentaje_avance: 18.3,
      area_asignada: 'Aserradero Principal',
    },
  ] as LoteProduccionGantt[],

  certificados: [
    {
      id: 1,
      folio_certificado: 'CERT-HT-2026-001',
      folio_lote: 'LOT-2026-001',
      cliente: 'Logística & Embalajes del Valle S.A.',
      codigo_sello_ht: 'MX-144-HT-089',
      temperatura_alcanzada: 58.4,
      tiempo_sostenimiento_min: 42,
      fecha_emision: '2026-09-17',
    },
    {
      id: 2,
      folio_certificado: 'CERT-HT-2026-002',
      folio_lote: 'LOT-2026-003',
      cliente: 'Automotive Freight Mexico',
      codigo_sello_ht: 'MX-144-HT-089',
      temperatura_alcanzada: 61.2,
      tiempo_sostenimiento_min: 55,
      fecha_emision: '2026-09-15',
    },
  ] as CertificadoFitosanitario[],

  inventarioMateriaPrima: {
    area: 'Planta Lerma - Almacén Principal',
    insumos: [
      { item: 'Madera Pino Verde (Troza/Tabla)', existencia: '450 m³ (~190,800 PT)', proveedor: 'Aserraderos del Valle' },
      { item: 'Madera Pino Estufada HT', existencia: '125 m³ (~53,000 PT)', proveedor: 'Interno (Horno HT-01)' },
      { item: 'Tabla Despalillada 1x6"', existencia: '18,400 pzs (~24,600 PT)', proveedor: 'Aserraderos del Valle' },
      { item: 'Clavo Espiral en Rollo 2 1/2"', existencia: '1,200 kg', proveedor: 'Sistemas de Sujeción Industrial' },
      { item: 'Clavo Estándar 3"', existencia: '250 kg', proveedor: 'Sistemas de Sujeción Industrial' },
      { item: 'Grapas de Sujeción 1"', existencia: '400 kg', proveedor: 'Fijaciones Lerma' },
    ],
  } as InventarioAlmacen,

  inventarioTarimas: {
    area: 'Planta Lerma - Almacén de Producto Terminado',
    total_piezas: 7770,
    total_pies_tablares: 44223,
    tarimas: [
      {
        id: 1,
        codigo: 'LOT-2026-001',
        modelo: 'Tarima Barrote 40x48',
        medidas: '40 x 48 x 5.5"',
        madera: 'Pino Estufada HT',
        piezas_disponibles: 4800,
        pies_tablares: 27648,
        ubicacion: 'Nave PT - Rack A1',
        cliente_reservado: 'Logística & Embalajes del Valle',
        estado: 'DISPONIBLE',
      },
      {
        id: 2,
        codigo: 'LOT-2026-002',
        modelo: 'Tarima Tacón Exportación 1200x1000mm',
        medidas: '1200 x 1000 x 150 mm',
        madera: 'Pino Estufada HT',
        piezas_disponibles: 1450,
        pies_tablares: 9135,
        ubicacion: 'Nave PT - Rack B2',
        cliente_reservado: 'Automotive Freight Mexico',
        estado: 'RESERVADO',
      },
      {
        id: 3,
        codigo: 'LOT-2026-003',
        modelo: 'Caja de Madera 120x100 Reforzada',
        medidas: '1200 x 800 x 800 mm',
        madera: 'Pino Estufada HT',
        piezas_disponibles: 620,
        pies_tablares: 7440,
        ubicacion: 'Nave PT - Rack C1',
        cliente_reservado: '—',
        estado: 'DISPONIBLE',
      },
      {
        id: 4,
        codigo: 'LOT-2026-004',
        modelo: 'Tarima Reciclada 48 x 40"',
        medidas: '48 x 40 x 5.5"',
        madera: 'Pino',
        piezas_disponibles: 900,
        pies_tablares: 0,
        ubicacion: 'Patio PT',
        cliente_reservado: '—',
        estado: 'EN_TRANSITO',
      },
    ],
  } as InventarioTarimasResponse,

  insumosClavado: [
    {
      id: 1,
      codigo: 'CLV-ESP-250',
      descripcion: 'Clavo Espiral en Rollo 2 1/2"',
      tipo: 'CLAVO_ESPIRAL',
      medida: '2 1/2"',
      existencia_kg: 1200,
      stock_minimo_kg: 300,
      linea_asignada: 'Línea A de Clavado',
    },
    {
      id: 2,
      codigo: 'CLV-STD-300',
      descripcion: 'Clavo Estándar 3"',
      tipo: 'CLAVO_ESPIRAL',
      medida: '3"',
      existencia_kg: 250,
      stock_minimo_kg: 400,
      linea_asignada: 'Línea B de Clavado',
    },
    {
      id: 3,
      codigo: 'GRP-100',
      descripcion: 'Grapas de Sujeción 1"',
      tipo: 'GRAPA',
      medida: '1"',
      existencia_kg: 400,
      stock_minimo_kg: 150,
      linea_asignada: 'Línea A de Clavado',
    },
    {
      id: 4,
      codigo: 'PINT-LER-5G',
      descripcion: 'Pintura de Marcado Epóxico 5 gal',
      tipo: 'PINTURA',
      medida: '5 galones',
      existencia_kg: 18.9,
      stock_minimo_kg: 10,
      linea_asignada: 'Almacén PT',
    },
  ] as InsumoClavado[],

  tarifas: [
    {
      id: 1,
      estado: 'México',
      municipio: 'Toluca',
      empresa: 'Transportes RENOVAL',
      kilometros: 62,
      precio_flete: 4200,
      costo_km: 67.74,
      capacidad_tarimas: 48,
      precio_unitario: 87.5,
      precio_reducido: 83.13,
    },
    {
      id: 2,
      estado: 'Ciudad de México',
      municipio: 'Iztapalapa',
      empresa: 'Transportes RENOVAL',
      kilometros: 45,
      precio_flete: 3800,
      costo_km: 84.44,
      capacidad_tarimas: 48,
      precio_unitario: 79.17,
      precio_reducido: 75.21,
    },
    {
      id: 3,
      estado: 'Morelos',
      municipio: 'Cuernavaca',
      empresa: 'Fletes del Sur',
      kilometros: 88,
      precio_flete: 5600,
      costo_km: 63.64,
      capacidad_tarimas: 54,
      precio_unitario: 103.7,
      precio_reducido: 98.52,
    },
    {
      id: 4,
      estado: 'Puebla',
      municipio: 'Puebla',
      empresa: 'Transportes RENOVAL',
      kilometros: 132,
      precio_flete: 7400,
      costo_km: 56.06,
      capacidad_tarimas: 60,
      precio_unitario: 123.33,
      precio_reducido: 117.17,
    },
    {
      id: 5,
      estado: 'Querétaro',
      municipio: 'Querétaro',
      empresa: 'Bajío Logística',
      kilometros: 215,
      precio_flete: 9800,
      costo_km: 45.58,
      capacidad_tarimas: 60,
      precio_unitario: 163.33,
      precio_reducido: 155.17,
    },
  ] as FleteTarifa[],

  destinos: [
    {
      id: 1,
      estado: 'México',
      municipio: 'Toluca',
      km: 62,
      costo_gasolina: 1450,
      costo_casetas: 380,
      precio_flete_total: 4200,
      capacidad_tarimas: 48,
      costo_tarima_unitario: 87.5,
    },
    {
      id: 2,
      estado: 'Ciudad de México',
      municipio: 'Iztapalapa',
      km: 45,
      costo_gasolina: 980,
      costo_casetas: 210,
      precio_flete_total: 3800,
      capacidad_tarimas: 48,
      costo_tarima_unitario: 79.17,
    },
    {
      id: 3,
      estado: 'Morelos',
      municipio: 'Cuernavaca',
      km: 88,
      costo_gasolina: 1850,
      costo_casetas: 460,
      precio_flete_total: 5600,
      capacidad_tarimas: 54,
      costo_tarima_unitario: 103.7,
    },
    {
      id: 4,
      estado: 'Puebla',
      municipio: 'Puebla',
      km: 132,
      costo_gasolina: 2740,
      costo_casetas: 720,
      precio_flete_total: 7400,
      capacidad_tarimas: 60,
      costo_tarima_unitario: 123.33,
    },
    {
      id: 5,
      estado: 'Querétaro',
      municipio: 'Querétaro',
      km: 215,
      costo_gasolina: 4300,
      costo_casetas: 980,
      precio_flete_total: 9800,
      capacidad_tarimas: 60,
      costo_tarima_unitario: 163.33,
    },
  ] as DestinoFlete[],

  viajes: [
    {
      id: 1,
      folio_cotizacion: 'COT-20260915-1042',
      tarifa_id: 2,
      operador_nombre: 'Diego Ramírez',
      unidad: 'Tractocamión 5H-9K-2',
      cantidad_tarimas: 40,
      costo_total_flete: 3166.8,
      estado: 'Pendiente',
      fecha_salida: '2026-09-18',
      destino: 'Iztapalapa, Ciudad de México',
      estado_tarifa: 'Ciudad de México',
      municipio: 'Iztapalapa',
      empresa: 'Transportes RENOVAL',
      kilometros: 45,
      costo_km: 84.44,
      precio_flete: 3800,
      capacidad_tarimas: 48,
      precio_unitario: 79.17,
      precio_reducido: 75.21,
    },
    {
      id: 2,
      folio_cotizacion: 'COT-20260916-1108',
      tarifa_id: 3,
      operador_nombre: 'María Torres',
      unidad: 'Trailer 44-KL-2M',
      cantidad_tarimas: 54,
      costo_total_flete: 5599.8,
      estado: 'Pendiente',
      fecha_salida: '2026-09-19',
      destino: 'Cuernavaca, Morelos',
      estado_tarifa: 'Morelos',
      municipio: 'Cuernavaca',
      empresa: 'Fletes del Sur',
      kilometros: 88,
      costo_km: 63.64,
      precio_flete: 5600,
      capacidad_tarimas: 54,
      precio_unitario: 103.7,
      precio_reducido: 98.52,
    },
    {
      id: 3,
      folio_cotizacion: 'COT-20260914-0957',
      tarifa_id: 1,
      operador_nombre: 'Carlos Mendoza',
      unidad: 'Tractocamión 77-AB-9X',
      cantidad_tarimas: 30,
      costo_total_flete: 2625,
      estado: 'En Tránsito',
      fecha_salida: '2026-09-17',
      destino: 'Toluca, México',
      estado_tarifa: 'México',
      municipio: 'Toluca',
      empresa: 'Transportes RENOVAL',
      kilometros: 62,
      costo_km: 67.74,
      precio_flete: 4200,
      capacidad_tarimas: 48,
      precio_unitario: 87.5,
      precio_reducido: 83.13,
    },
    {
      id: 4,
      folio_cotizacion: 'COT-20260910-1615',
      tarifa_id: 4,
      operador_nombre: 'Rubén Gutiérrez',
      unidad: 'Trailer 12-CV-7N',
      cantidad_tarimas: 60,
      costo_total_flete: 7399.8,
      estado: 'Completado',
      fecha_salida: '2026-09-12',
      destino: 'Puebla, Puebla',
      estado_tarifa: 'Puebla',
      municipio: 'Puebla',
      empresa: 'Transportes RENOVAL',
      kilometros: 132,
      costo_km: 56.06,
      precio_flete: 7400,
      capacidad_tarimas: 60,
      precio_unitario: 123.33,
      precio_reducido: 117.17,
    },
  ] as ViajeLogisticaDetalle[],

  embarques: [
    {
      id: 1,
      folio_embarque: 'EMB-2026-881',
      cliente: 'Logística & Embalajes del Valle',
      chofer: 'Carlos Mendoza',
      placas_trailer: '77-AB-9X',
      destino: 'Toluca, Estado de México',
      tarimas_cargadas: 600,
      fecha_despacho: '2026-09-17',
      estatus: 'EN_TRANSITO',
    },
    {
      id: 2,
      folio_embarque: 'EMB-2026-880',
      cliente: 'Automotive Freight Mexico',
      chofer: 'María Torres',
      placas_trailer: '44-KL-2M',
      destino: 'Iztapalapa, Ciudad de México',
      tarimas_cargadas: 450,
      fecha_despacho: '2026-09-20',
      estatus: 'PROGRAMADO',
    },
    {
      id: 3,
      folio_embarque: 'EMB-2026-879',
      cliente: 'Empaques Industriales Lerma',
      chofer: 'Rubén Gutiérrez',
      placas_trailer: '12-CV-7N',
      destino: 'Puebla, Puebla',
      tarimas_cargadas: 800,
      fecha_despacho: '2026-09-12',
      estatus: 'ENTREGADO',
    },
    {
      id: 4,
      folio_embarque: 'EMB-2026-882',
      cliente: 'Logística & Embalajes del Valle',
      chofer: 'Diego Ramírez',
      placas_trailer: '5H-9K-2',
      destino: 'Cuernavaca, Morelos',
      tarimas_cargadas: 540,
      fecha_despacho: '2026-09-22',
      estatus: 'PROGRAMADO',
    },
  ] as EmbarqueDespacho[],
};

// ------------------------------------------------------------------------------
// Constantes de respaldo (Modo Demo): el frontend las usa como estado inicial
// para que cada vista SIEMPRE tenga datos estructurados, incluso sin backend.
// ------------------------------------------------------------------------------
export const MOCK_METRICAS: DashboardMetrics = db.metrics;
export const MOCK_LOTES_GANTT: LoteProduccionGantt[] = db.lotes;
export const MOCK_TARIMAS: InventarioTarimasResponse = db.inventarioTarimas;
export const MOCK_MATERIA_PRIMA: InventarioAlmacen = db.inventarioMateriaPrima;
export const MOCK_EMBARQUES: EmbarqueDespacho[] = db.embarques;
export const MOCK_TARIFAS_FLETES: FleteTarifa[] = db.tarifas;
export const MOCK_VIAJES_PENDIENTES: ViajeLogisticaDetalle[] = db.viajes.filter(
  (viaje) => viaje.estado === 'Pendiente'
);

// ------------------------------------------------------------------------------
// Handlers de cada endpoint simulado
// ------------------------------------------------------------------------------
const handlers: Record<string, MockHandler> = {
  'GET v1/dashboard/metrics': () => ok(db.metrics),

  'GET v1/produccion/gantt': () => ok(db.lotes),

  'GET v1/fitosanitario/certificados': () => ok(db.certificados),

  'GET v1/almacen/inventario-materia-prima': () => ok(db.inventarioMateriaPrima),

  'GET v1/inventario/tarimas': () => ok(db.inventarioTarimas),

  'GET v1/almacen/insumos-clavado': () => ok(db.insumosClavado),

  'GET v1/logistica/fletes-destino': () => ok(db.destinos),

  'GET v1/logistica/embarques': () => ok(db.embarques),

  'GET v1/logistica/tarifas': () => ok(db.tarifas),

  'POST v1/logistica/tarifas': (request) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const nueva = completarTarifa({
      id: siguienteId(db.tarifas),
      estado: toText(body.estado).trim(),
      municipio: toText(body.municipio).trim(),
      empresa: toText(body.empresa, 'Transportes RENOVAL').trim(),
      kilometros: Math.max(0, toNumber(body.kilometros)),
      precio_flete: Math.max(0, toNumber(body.precio_flete)),
      costo_km: 0,
      capacidad_tarimas: Math.max(0, toNumber(body.capacidad_tarimas)),
      precio_unitario: 0,
      precio_reducido: 0,
    });
    if (!nueva.municipio) return notFound('El municipio/destino es obligatorio');
    db.tarifas = [...db.tarifas, nueva];
    return created(nueva);
  },

  'PATCH v1/logistica/tarifas/:id': (request) => {
    const id = toNumber(request.params[0]);
    const actual = db.tarifas.find((tarifa) => tarifa.id === id);
    if (!actual) return notFound('Tarifa no encontrada');
    const body = (request.body ?? {}) as Record<string, unknown>;
    const actualizada = completarTarifa({
      ...actual,
      estado: body.estado === undefined ? actual.estado : toText(body.estado, actual.estado).trim(),
      municipio: body.municipio === undefined ? actual.municipio : toText(body.municipio, actual.municipio).trim(),
      empresa: body.empresa === undefined ? actual.empresa : toText(body.empresa, actual.empresa).trim(),
      kilometros: body.kilometros === undefined ? actual.kilometros : Math.max(0, toNumber(body.kilometros)),
      precio_flete: body.precio_flete === undefined ? actual.precio_flete : Math.max(0, toNumber(body.precio_flete)),
      capacidad_tarimas:
        body.capacidad_tarimas === undefined ? actual.capacidad_tarimas : Math.max(0, toNumber(body.capacidad_tarimas)),
    });
    db.tarifas = db.tarifas.map((tarifa) => (tarifa.id === id ? actualizada : tarifa));
    return ok(actualizada);
  },

  'DELETE v1/logistica/tarifas/:id': (request) => {
    const id = toNumber(request.params[0]);
    if (!db.tarifas.some((tarifa) => tarifa.id === id)) return notFound('Tarifa no encontrada');
    db.tarifas = db.tarifas.filter((tarifa) => tarifa.id !== id);
    return noContent();
  },

  'GET v1/logistica/viajes': () => ok(db.viajes),

  'GET v1/logistica/viajes/pendientes': () => ok(db.viajes.filter((viaje) => viaje.estado === 'Pendiente')),

  'POST v1/logistica/viajes': (request) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const tarifa = db.tarifas.find((item) => item.id === toNumber(body.tarifa_id));
    if (!tarifa) return notFound('Tarifa/destino no encontrado');
    const nuevo = { ...construirViaje(tarifa, body), id: siguienteId(db.viajes) };
    db.viajes = [nuevo, ...db.viajes];
    return created(nuevo);
  },

  'PATCH v1/logistica/viajes/:id/aprobar': (request) => {
    const id = toNumber(request.params[0]);
    const actual = db.viajes.find((viaje) => viaje.id === id);
    if (!actual) return notFound('Viaje no encontrado');
    const body = (request.body ?? {}) as Record<string, unknown>;
    const estadoPropuesto = toText(body.estado, 'En Tránsito') as EstadoViaje;
    const estado = ESTADOS_VIAJE.includes(estadoPropuesto) ? estadoPropuesto : 'En Tránsito';
    const actualizado = { ...actual, estado };
    db.viajes = db.viajes.map((viaje) => (viaje.id === id ? actualizado : viaje));
    return ok(actualizado);
  },

  'POST v1/auth/login': (request) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const email = toText(body.email, 'admin@renoval.com');
    const identificador = email.split('@')[0].toLowerCase();
    const esOperador = identificador.includes('operador');
    const respuesta: TokenResponse = {
      access_token: 'demo_token_renoval_2026',
      token_type: 'bearer',
      user_info: {
        email,
        nombre: esOperador ? 'Operador Demo' : 'Ing. Rafael',
        rol: esOperador ? 'OPERADOR_PLANTA' : 'ADMIN',
        area: 'Planta Lerma',
      },
    };
    return ok(respuesta);
  },

  'POST v1/auth/registro': () => created({ status: 'exito', mensaje: 'Usuario creado correctamente (Modo Demo)' }),

  'POST v1/cotizaciones/calcular': (request) => {
    const payload = (request.body ?? {}) as Partial<CotizacionPayload>;
    const elementos = payload.elementos ?? [];
    const pieTablarTotal = elementos.reduce(
      (total, el) =>
        total + ((toNumber(el.ancho_in) * toNumber(el.grueso_in) * toNumber(el.largo_in)) / 144) * toNumber(el.piezas_por_tarima),
      0
    );
    const costoMadera = elementos.reduce(
      (total, el) =>
        total +
        ((toNumber(el.ancho_in) * toNumber(el.grueso_in) * toNumber(el.largo_in)) / 144) *
          toNumber(el.precio_pie_tabla) *
          toNumber(el.piezas_por_tarima),
      0
    );
    const costosAdicionales =
      toNumber(payload.costo_estufa_ht) +
      toNumber(payload.costo_saque) +
      toNumber(payload.costo_cepillado) +
      toNumber(payload.costo_transporte) +
      50 +
      20;
    const costoUnitario = redondear(costoMadera + costosAdicionales);
    const utilidadUnitaria = redondear(toNumber(payload.precio_sugerido_unidad) - costoUnitario);

    return ok({
      status: 'exito',
      folio: folioCotizacion(),
      costo_unitario: costoUnitario,
      utilidad_unitaria: utilidadUnitaria,
      pie_tablar_total: redondear(pieTablarTotal, 3),
    });
  },
};

// ------------------------------------------------------------------------------
// Resolución de rutas (método + path con/:params)
// ------------------------------------------------------------------------------
const normalizarRuta = (ruta: string): string =>
  ruta
    .split('?')[0]
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

interface RutaEncontrada {
  handler: MockHandler;
  params: string[];
}

const buscarRuta = (method: string, ruta: string): RutaEncontrada | null => {
  const segments = normalizarRuta(ruta).split('/');
  for (const [clave, handler] of Object.entries(handlers)) {
    const espacios = clave.indexOf(' ');
    const metodo = clave.slice(0, espacios);
    const plantilla = clave.slice(espacios + 1).split('/');
    if (metodo !== method) continue;
    if (plantilla.length !== segments.length) continue;

    const params: string[] = [];
    let coincide = true;
    for (let i = 0; i < plantilla.length; i++) {
      const esperado = plantilla[i];
      if (esperado.startsWith(':')) params.push(segments[i]);
      else if (esperado !== segments[i]) {
        coincide = false;
        break;
      }
    }
    if (coincide) return { handler, params };
  }
  return null;
};

const parsearBody = (data: unknown): unknown => {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data) as unknown;
  } catch {
    return undefined;
  }
};

export const hasMockFor = (method: string, ruta: string): boolean => buscarRuta(method, ruta) !== null;

export const getMockResponse = (method: string, ruta: string, data: unknown): MockResponse | null => {
  const encontrada = buscarRuta(method, ruta);
  if (!encontrada) return null;

  try {
    const respuesta = encontrada.handler({
      method,
      path: normalizarRuta(ruta),
      params: encontrada.params,
      body: parsearBody(data),
    });

    // Nunca devolver undefined/null donde el frontend espera datos válidos.
    if (!respuesta || typeof respuesta.status !== 'number') {
      return ok([]);
    }
    if (respuesta.data === undefined) {
      return { ...respuesta, data: respuesta.status === 204 ? null : [] };
    }
    return respuesta;
  } catch (error) {
    console.error(`[demoMocks] Falló el handler para ${method} ${ruta}`, error);
    return ok([]);
  }
};
