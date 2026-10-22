import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../api/dashboard';
import { MOCK_METRICAS } from '../api/demoMocks';
import { PlusCircle, TrendingUp, Boxes, Loader2 } from 'lucide-react';

interface DashboardViewProps {
  userName: string;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userName, onNavigate, isDarkMode }) => {
  // initialData: el Panel Principal arranca con datos del Modo Demo y nunca
  // queda en undefined/vacío, aunque la API falle o no responda.
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    initialData: MOCK_METRICAS,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const metricas = data ?? MOCK_METRICAS;

  return (
    <div className="space-y-6">
      <React.Fragment key="welcome">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
              <p className="text-emerald-100 text-sm">Planta Lerma • Ingeniero de Producción</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('cotizador')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-lime-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-lime-300 transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nueva Cotización</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-400 -mt-3">
          {isFetching && (
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> Sincronizando con API...
            </span>
          )}
          {!isFetching && !isLoading && <span>Datos en tiempo real (Modo Demo si el backend está offline)</span>}
        </div>
      </React.Fragment>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
          <span className="text-xs font-bold text-gray-400 tracking-wider">TARIMAS PRODUCIDAS (MES)</span>
          <div className="text-4xl font-black text-emerald-400 mt-2">
            {metricas.tarimas_producidas.toLocaleString('es-MX')}
            <span className="text-lg text-emerald-500/70 ml-1">pzs</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">{metricas.lotes_completados} lotes completados</div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>MARGEN UTILIDAD PROMEDIO</span>
          </div>
          <div className="text-4xl font-black mt-2 text-lime-400">{metricas.utilidad_promedio_pct}%</div>
          <div className="text-xs text-gray-400 mt-2">
            +${metricas.utilidad_promedio_monto} MXN por unidad
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider mb-4">
            <Boxes className="w-4 h-4" />
            <span>MODELOS MÁS COTIZADOS</span>
          </div>
          <div className="space-y-3 text-sm">
            {metricas.top_modelos.map((model, idx) => (
              <div key={`${model.nombre}-${idx}`} className="flex justify-between border-b border-gray-800 pb-2 last:border-0">
                <span className="text-gray-300">{model.nombre}</span>
                <span className="font-bold text-emerald-400">{model.unidades.toLocaleString('es-MX')} u</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">ESTATUS DE TRATAMIENTO FITOSANITARIO (NOM-144)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs text-gray-400">ESTUFADO HT EN PROCESO</div>
            <div className="text-xl font-bold mt-1 text-amber-400">
              {metricas.ht_en_proceso_lotes} Lotes Activos ({metricas.ht_en_proceso_piezas.toLocaleString('es-MX')} pzs)
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs text-gray-400">CERTIFICADOS LIBERADOS</div>
            <div className="text-xl font-bold mt-1 text-emerald-400">{metricas.certificados_liberados} Emitidos</div>
          </div>
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs text-gray-400">SELLOS HT DISPONIBLES</div>
            <div className="text-xl font-bold mt-1">Conforme a norma</div>
          </div>
        </div>
      </div>
    </div>
  );
};