import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Download, BarChart3, TrendingUp, 
  Loader2, Calendar, Filter, ChevronDown 
} from 'lucide-react';
import { getProduccionGantt, getControlMermas, getEmbarquesDespacho, getCertificadosFitosanitarios, getClientes, getInsumosClavado } from '../api/modulos';

interface ReporteProduccion {
  folio_lote: string;
  producto: string;
  piezas_totales: number;
  piezas_completadas: number;
  etapa_actual: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  area_asignada: string;
}

interface ReporteMerma {
  folio_lote: string;
  pt_teoricos: number;
  pt_reales_utilizados: number;
  pt_desperdicio: number;
  porcentaje_scrap: number;
  causa_principal: string;
}

interface ReporteEmbarque {
  folio_embarque: string;
  cliente: string;
  chofer: string;
  placas_trailer: string;
  tarimas_cargadas: number;
  fecha_despacho: string;
  estatus: string;
}

export const ReportesView: React.FC = () => {
  const [fechaDesde, setFechaDesde] = React.useState<string>('');
  const [fechaHasta, setFechaHasta] = React.useState<string>('');
  const [tipoReporte, setTipoReporte] = React.useState<'produccion' | 'mermas' | 'embarques' | 'certificados' | 'inventario' | 'clientes'>('produccion');
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  const { data: lotes, isLoading: loadingLotes } = useQuery({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: mermas, isLoading: loadingMermas } = useQuery({
    queryKey: ['mermas-scrap'],
    queryFn: getControlMermas,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: embarques, isLoading: loadingEmbarques } = useQuery({
    queryKey: ['embarques-despacho'],
    queryFn: getEmbarquesDespacho,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: certificados } = useQuery({
    queryKey: ['certificados-ht'],
    queryFn: getCertificadosFitosanitarios,
    staleTime: 60000,
  });

  const { data: insumos } = useQuery({
    queryKey: ['insumos-clavado'],
    queryFn: getInsumosClavado,
    staleTime: 60000,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
    staleTime: 60000,
  });

  const loading = loadingLotes || loadingMermas || loadingEmbarques;

  const getFilteredData = () => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';

    switch (tipoReporte) {
      case 'produccion':
        data = lotes || [];
        headers = ['Folio', 'Producto', 'Total Pzs', 'Completadas', 'Etapa', 'Inicio', 'Fin Est.', 'Area', '% Avance'];
        filename = 'reporte_produccion';
        break;
      case 'mermas':
        data = mermas || [];
        headers = ['Folio Lote', 'PT Teoricos', 'PT Reales', 'Desperdicio (PT)', 'Scrap %', 'Causa'];
        filename = 'reporte_mermas';
        break;
      case 'embarques':
        data = embarques || [];
        headers = ['Folio', 'Cliente', 'Chofer', 'Placas', 'Tarimas', 'Fecha', 'Estatus'];
        filename = 'reporte_embarques';
        break;
      case 'certificados':
        data = certificados || [];
        headers = ['Folio Certificado', 'Folio Lote', 'Cliente', 'Sello HT', 'Temp (°C)', 'Tiempo (min)', 'Fecha Emision'];
        filename = 'reporte_certificados';
        break;
      case 'inventario':
        data = insumos || [];
        headers = ['Codigo', 'Descripcion', 'Tipo', 'Medida', 'Existencia (kg)', 'Stock Min (kg)', 'Linea', 'Estado'];
        filename = 'reporte_inventario';
        break;
      case 'clientes':
        data = clientes || [];
        headers = ['Razon Social', 'RFC', 'Limite Credito', 'Credito Utilizado', 'Anticipos', 'Disponible', 'Saldo Pendiente'];
        filename = 'reporte_clientes';
        break;
    }
    return { data, headers, filename };
  };

  const { data: reportData, headers, filename } = getFilteredData();

  const formatRow = (item: any): string[] => {
    switch (tipoReporte) {
      case 'produccion':
        return [
          item.folio_lote,
          item.producto,
          item.piezas_totales.toString(),
          item.piezas_completadas.toString(),
          item.etapa_actual,
          item.fecha_inicio,
          item.fecha_fin_estimada,
          item.area_asignada,
          `${((item.piezas_completadas / item.piezas_totales) * 100).toFixed(1)}%`
        ];
      case 'mermas':
        return [
          item.folio_lote,
          item.pt_teoricos.toString(),
          item.pt_reales_utilizados.toString(),
          item.pt_desperdicio.toString(),
          `${item.porcentaje_scrap.toFixed(1)}%`,
          item.causa_principal
        ];
      case 'embarques':
        return [
          item.folio_embarque,
          item.cliente,
          item.chofer,
          item.placas_trailer,
          item.tarimas_cargadas.toString(),
          item.fecha_despacho,
          item.estatus
        ];
      case 'certificados':
        return [
          item.folio_certificado,
          item.folio_lote,
          item.cliente,
          item.codigo_sello_ht,
          item.temperatura_alcanzada.toString(),
          item.tiempo_sostenimiento_min.toString(),
          item.fecha_emision
        ];
      case 'inventario':
        const status = item.existencia_kg <= item.stock_minimo_kg ? 'CRITICO' : 
                       item.existencia_kg <= item.stock_minimo_kg * 1.5 ? 'BAJO' : 'OK';
        return [
          item.codigo,
          item.descripcion,
          item.tipo,
          item.medida,
          item.existencia_kg.toLocaleString(),
          item.stock_minimo_kg.toLocaleString(),
          item.linea_asignada,
          status
        ];
      case 'clientes':
        const disponible = item.limite_credito - item.credito_utilizado;
        const saldo = item.credito_utilizado - item.anticipos_registrados;
        return [
          item.razon_social,
          item.rfc,
          item.limite_credito.toLocaleString(),
          item.credito_utilizado.toLocaleString(),
          item.anticipos_registrados.toLocaleString(),
          disponible.toLocaleString(),
          saldo.toLocaleString()
        ];
      default:
        return [];
    }
  };

  const exportCSV = () => {
    const rows = [headers.join(','), ...reportData.map(item => formatRow(item).map(v => `"${v}"`).join(','))];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getKpiCards = () => {
    switch (tipoReporte) {
      case 'produccion':
        const totalLotes = reportData.length;
        const totalPzs = reportData.reduce((sum: number, l: ReporteProduccion) => sum + l.piezas_totales, 0);
        const completadas = reportData.reduce((sum: number, l: ReporteProduccion) => sum + l.piezas_completadas, 0);
        const enHT = reportData.filter((l: ReporteProduccion) => l.etapa_actual === 'HT_FITOSANITARIO').length;
        return [
          { label: 'Total Lotes', value: totalLotes, icon: FileText, color: 'text-blue-400' },
          { label: 'Total Piezas', value: totalPzs.toLocaleString(), icon: BarChart3, color: 'text-emerald-400' },
          { label: 'Completadas', value: completadas.toLocaleString(), icon: TrendingUp, color: 'text-lime-400' },
          { label: 'En HT', value: enHT, icon: Calendar, color: 'text-amber-400' },
        ];
      case 'mermas':
        const totalMerma = reportData.reduce((sum: number, m: ReporteMerma) => sum + m.pt_desperdicio, 0);
        const avgScrap = reportData.length ? reportData.reduce((sum: number, m: ReporteMerma) => sum + m.porcentaje_scrap, 0) / reportData.length : 0;
        const lotesAfectados = new Set(reportData.map((m: ReporteMerma) => m.folio_lote)).size;
        return [
          { label: 'Total Merma (PT)', value: totalMerma.toLocaleString(), icon: TrendingUp, color: 'text-red-400' },
          { label: 'Promedio Scrap %', value: `${avgScrap.toFixed(1)}%`, icon: BarChart3, color: 'text-amber-400' },
          { label: 'Lotes Afectados', value: lotesAfectados, icon: FileText, color: 'text-blue-400' },
          { label: 'Registros', value: reportData.length, icon: Calendar, color: 'text-gray-400' },
        ];
      case 'embarques':
        const totalTarimas = reportData.reduce((sum: number, e: ReporteEmbarque) => sum + e.tarimas_cargadas, 0);
        const enTransito = reportData.filter((e: ReporteEmbarque) => e.estatus === 'EN_TRANSITO').length;
        const entregados = reportData.filter((e: ReporteEmbarque) => e.estatus === 'ENTREGADO').length;
        return [
          { label: 'Total Embarques', value: reportData.length, icon: FileText, color: 'text-blue-400' },
          { label: 'Tarimas Totales', value: totalTarimas.toLocaleString(), icon: BarChart3, color: 'text-emerald-400' },
          { label: 'En Tránsito', value: enTransito, icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Entregados', value: entregados, icon: Calendar, color: 'text-lime-400' },
        ];
      default:
        return [
          { label: 'Total Registros', value: reportData.length, icon: FileText, color: 'text-blue-400' },
        ];
    }
  };

  const kpiCards = getKpiCards();

  const tipoLabels: Record<string, string> = {
    produccion: 'Producción & Lotes',
    mermas: 'Mermas & Scrap',
    embarques: 'Embarques & Despacho',
    certificados: 'Certificados HT (NOM-144)',
    inventario: 'Inventario Insumos',
    clientes: 'Clientes & Crédito'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando datos para reportes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-950/80 border border-purple-800/60 rounded-xl text-purple-400">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reportes & Exportación de Datos</h2>
            <p className="text-xs text-gray-400">Visualiza, filtra y exporta reportes operativos a CSV.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDateFilter(!showDateFilter)} className="p-2 bg-[#181d29] border border-[#252c3d] rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition">
            <Filter className="w-5 h-5" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Selector de tipo reporte + filtros fecha */}
      <div className="bg-[#10141d] p-4 rounded-2xl border border-[#1e2430]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-gray-400">TIPO DE REPORTE:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'produccion', icon: FileText },
              { key: 'mermas', icon: TrendingUp },
              { key: 'embarques', icon: Calendar },
              { key: 'certificados', icon: BarChart3 },
              { key: 'inventario', icon: Download },
              { key: 'clientes', icon: Filter }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTipoReporte(t.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  tipoReporte === t.key
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {tipoLabels[t.key]}
              </button>
            ))}
          </div>
        </div>

        {showDateFilter && (
          <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">Desde:</label>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="bg-[#181d29] border border-[#252c3d] rounded-xl text-sm px-2 py-1 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">Hasta:</label>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="bg-[#181d29] border border-[#252c3d] rounded-xl text-sm px-2 py-1 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className="text-xs font-bold text-gray-400">{kpi.label}</span>
            </div>
            <div className="text-2xl font-black text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla de datos */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reportData.length > 0 ? (
                reportData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    {formatRow(item).map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-gray-300">{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="p-6 text-center text-gray-400">No hay datos para este reporte</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-right">
          Mostrando {reportData.length} registros • {new Date().toLocaleString('es-MX')}
        </div>
      </div>
    </div>
  );
};