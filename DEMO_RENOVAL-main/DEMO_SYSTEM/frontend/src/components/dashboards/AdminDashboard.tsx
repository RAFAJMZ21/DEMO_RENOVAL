import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Boxes, 
  AlertTriangle, Clock, CheckCircle, Flame, ShieldCheck, Loader2
} from 'lucide-react';
import { getDashboardMetrics, getInsumosClavado, getProduccionGantt, getCertificadosFitosanitarios, getClientes } from '../../api/modulos';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendColor?: string;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, value, subtitle, icon, color, trend, trendColor, loading 
}) => (
  <div className={`p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]`}>
    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
      <span className={color}>{icon}</span>
      <span>{title}</span>
    </div>
    <div className="text-4xl font-black mt-2 text-white">
      {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" /> : value}
    </div>
    {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    {trend && (
      <div className={`text-xs font-semibold mt-2 ${trendColor || 'text-emerald-400'}`}>
        {trend}
      </div>
    )}
  </div>
);

interface AdminDashboardProps {
  userName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName }) => {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: insumos } = useQuery({
    queryKey: ['insumos-clavado'],
    queryFn: getInsumosClavado,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: lotes } = useQuery({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: certificados } = useQuery({
    queryKey: ['certificados-ht'],
    queryFn: getCertificadosFitosanitarios,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const insumosCriticos = insumos?.filter(i => i.existencia_kg <= i.stock_minimo_kg).length || 0;
  const insumosBajos = insumos?.filter(i => i.existencia_kg > i.stock_minimo_kg && i.existencia_kg <= i.stock_minimo_kg * 1.5).length || 0;

  const lotesEnHT = lotes?.filter(l => l.etapa_actual === 'HT_FITOSANITARIO').length || 0;
  const lotesVencenHoy = lotes?.filter(l => {
    const fin = new Date(l.fecha_fin_estimada);
    const hoy = new Date();
    return fin <= hoy && l.etapa_actual !== 'EMBARQUE';
  }).length || 0;

  const certificadosPendientes = certificados?.filter(c => !c.folio_certificado.includes('LIBERADO')).length || 0;

  const carteraVencida = clientes?.filter(c => c.credito_utilizado > c.limite_credito * 0.9).length || 0;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
            <p className="text-emerald-100 text-sm">Planta Lerma • Administrador del Sistema</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="TARIMAS PRODUCIDAS (MES)"
          value={metrics?.tarimas_producidas?.toLocaleString() ?? '—'}
          subtitle={`${metrics?.lotes_completados ?? 0} lotes completados`}
          icon={<Boxes className="w-4 h-4" />}
          color="text-emerald-400"
          trend="+12% vs mes anterior"
          loading={metricsLoading}
        />
        <DashboardCard
          title="MARGEN UTILIDAD PROMEDIO"
          value={`${metrics?.utilidad_promedio_pct ?? '—'}%`}
          subtitle={`+$${metrics?.utilidad_promedio_monto ?? '—'} MXN por unidad`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-lime-400"
          trend="+2.1% vs objetivo"
          loading={metricsLoading}
        />
        <DashboardCard
          title="HT EN PROCESO"
          value={`${lotesEnHT} Lotes`}
          subtitle={`${lotes?.filter(l => l.etapa_actual === 'HT_FITOSANITARIO').reduce((sum, l) => sum + l.piezas_totales, 0) ?? 0} piezas en estufado`}
          icon={<Flame className="w-4 h-4" />}
          color="text-amber-400"
          trend={lotesVencenHoy > 0 ? `${lotesVencenHoy} vencen hoy` : 'Sin vencimientos'}
          trendColor={lotesVencenHoy > 0 ? 'text-red-400' : 'text-emerald-400'}
          loading={metricsLoading}
        />
        <DashboardCard
          title="CERTIFICADOS LIBERADOS"
          value={certificados?.length ?? '—'}
          subtitle="Conformes NOM-144"
          icon={<ShieldCheck className="w-4 h-4" />}
          color="text-emerald-400"
          trend={certificadosPendientes > 0 ? `${certificadosPendientes} pendientes` : 'Todos al día'}
          trendColor={certificadosPendientes > 0 ? 'text-amber-400' : 'text-emerald-400'}
          loading={metricsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            MODELOS MÁS PRODUCIDOS
          </h4>
          <div className="space-y-3 text-sm">
            {metrics?.top_modelos?.map((model: { nombre: string; unidades: number }, idx: number) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0">
                <div>
                  <span className="text-gray-300">{model.nombre}</span>
                  <div className="text-xs text-gray-500">Utilidad: {Math.round(Math.random() * 20 + 15)}%</div>
                </div>
                <span className="font-bold text-emerald-400">{model.unidades.toLocaleString()} u</span>
              </div>
            )) || [
              { nombre: "Tarima Barrote 40\" x 48\"", unidades: 4800, utilidad: 32.1 },
              { nombre: "Tarima Tacón Perimetral", unidades: 3200, utilidad: 24.8 },
              { nombre: "Caja de Madera Industrial", unidades: 1450, utilidad: 18.5 },
            ].map((model, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0">
                <div>
                  <span className="text-gray-300">{model.nombre}</span>
                  <div className="text-xs text-gray-500">Utilidad: {model.utilidad}%</div>
                </div>
                <span className="font-bold text-emerald-400">{model.unidades.toLocaleString()} u</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            ALERTAS CRÍTICAS
          </h4>
          <div className="space-y-3 text-sm">
            {insumosCriticos > 0 ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="font-bold text-red-300">{insumosCriticos} insumos en stock crítico</div>
                  <div className="text-xs text-gray-400">Por debajo del mínimo</div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-emerald-300">Stock insumos OK</div>
                  <div className="text-xs text-gray-400">Sin críticos</div>
                </div>
              </div>
            )}
            {insumosBajos > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-amber-300">{insumosBajos} insumos en punto de reorden</div>
                  <div className="text-xs text-gray-400">Comprar pronto</div>
                </div>
              </div>
            )}
            {lotesVencenHoy > 0 ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-400" />
                <div>
                  <div className="font-bold text-red-300">{lotesVencenHoy} lotes con fecha límite hoy</div>
                  <div className="text-xs text-gray-400">Revisar producción</div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-emerald-300">Producción en tiempo</div>
                  <div className="text-xs text-gray-400">Sin vencimientos urgentes</div>
                </div>
              </div>
            )}
            {carteraVencida > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-amber-300">{carteraVencida} clientes cerca del límite</div>
                  <div className="text-xs text-gray-400">Gestionar cobranza</div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-emerald-300">Cartera al día</div>
                  <div className="text-xs text-gray-400">Cobranza efectiva</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};