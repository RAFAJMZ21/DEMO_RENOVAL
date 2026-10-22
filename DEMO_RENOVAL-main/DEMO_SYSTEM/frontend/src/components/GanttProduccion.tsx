import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduccionGantt } from '../api/modulos';
import { Calendar, CheckCircle2, Flame, Hammer, Loader2, ChevronRight } from 'lucide-react';

interface LoteGantt {
  id: number;
  folio_lote: string;
  producto: string;
  piezas_totales: number;
  piezas_completadas: number;
  etapa_actual: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  porcentaje_avance: number;
  area_asignada: string;
}

const diasTimeline = [
  { label: 'Lun 14', fechaStr: '2026-09-14' },
  { label: 'Mar 15', fechaStr: '2026-09-15' },
  { label: 'Mié 16', fechaStr: '2026-09-16' },
  { label: 'Jue 17', fechaStr: '2026-09-17' }, // Hoy
  { label: 'Vie 18', fechaStr: '2026-09-18' },
  { label: 'Sáb 19', fechaStr: '2026-09-19' },
  { label: 'Dom 20', fechaStr: '2026-09-20' },
  { label: 'Lun 21', fechaStr: '2026-09-21' },
  { label: 'Mar 22', fechaStr: '2026-09-22' },
];

const getStageIcon = (etapa: string) => {
  switch (etapa) {
    case 'HT_FITOSANITARIO': return <Flame className="w-3.5 h-3.5 text-amber-200" />;
    case 'ARMADO': return <Hammer className="w-3.5 h-3.5 text-cyan-200" />;
    case 'EMBARQUE': return <CheckCircle2 className="w-3.5 h-3.5 text-lime-200" />;
    default: return <span className="w-3.5 h-3.5" />;
  }
};

const getStageColor = (etapa: string) => {
  switch (etapa) {
    case 'HT_FITOSANITARIO': return 'from-amber-600 to-amber-500';
    case 'EMBARQUE': return 'from-emerald-600 to-lime-500';
    default: return 'from-blue-600 to-cyan-500';
  }
};

export const GanttProduccion: React.FC = () => {
  const { data: lotes, isLoading, isFetching } = useQuery<LoteGantt[]>({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading && !lotes) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando programación de lotes en tiempo real...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-[#1e2430] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400 relative">
            <Calendar className="w-7 h-7" />
            {isFetching && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2">
              Control de Producción & Diagrama de Gantt
              {isFetching && <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Sincronizando...</span>}
            </h2>
            <p className="text-xs text-gray-400">Programación de lotes, avance por fases y trazabilidad fitosanitaria.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold w-full lg:w-auto">
          <span className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> A tiempo
          </span>
          <span className="flex items-center gap-1.5 bg-amber-950/60 text-amber-400 px-3 py-1.5 rounded-full border border-amber-800/50">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> En Proceso HT
          </span>
          <span className="flex items-center gap-1.5 bg-blue-950/60 text-blue-400 px-3 py-1.5 rounded-full border border-blue-800/50">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Armado / Clavado
          </span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {lotes?.map((lote) => (
          <div key={lote.id} className="bg-[#10141d] p-4 rounded-xl border border-[#1e2430] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{lote.folio_lote}</span>
                  <span className="text-[10px] bg-[#181d29] text-gray-300 border border-[#252c3d] px-2 py-0.5 rounded-full font-semibold">
                    {lote.piezas_completadas} / {lote.piezas_totales} pzs
                  </span>
                </div>
                <div className="font-bold text-sm text-white truncate mt-1">{lote.producto}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Etapa Actual</div>
                <div className="flex items-center gap-1 text-white font-semibold mt-1">
                  {getStageIcon(lote.etapa_actual)}
                  <span>{lote.etapa_actual}</span>
                </div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Avance</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{lote.porcentaje_avance}%</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d] col-span-2">
                <div className="text-gray-400">Área Asignada</div>
                <div className="text-white font-medium mt-1 truncate">{lote.area_asignada}</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d] col-span-2">
                <div className="text-gray-400">Fechas</div>
                <div className="text-white font-mono mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Inicio: {lote.fecha_inicio}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Fin: {lote.fecha_fin_estimada}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#181d29] rounded-lg border border-[#252c3d] overflow-hidden">
              <div 
                className={`h-6 rounded-none transition-all duration-500 ${getStageColor(lote.etapa_actual)}`}
                style={{ width: `${lote.porcentaje_avance}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Gantt View */}
      <div className="hidden lg:block bg-[#10141d] p-6 rounded-xl lg:rounded-2xl border border-[#1e2430] overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-12 gap-2 border-b border-gray-800 pb-3 text-xs font-bold text-gray-400">
            <div className="col-span-4 px-2">LOTE / PRODUCTO DE MADERA</div>
            <div className="col-span-8 grid grid-cols-9 gap-1 text-center font-mono">
              {diasTimeline.map((dia, idx) => (
                <div 
                  key={idx} 
                  className={`py-1.5 rounded-lg border ${
                    dia.fechaStr === '2026-09-17' 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-extrabold shadow-sm' 
                      : 'bg-[#181d29] border-[#252c3d]'
                  }`}
                >
                  {dia.label}
                  {dia.fechaStr === '2026-09-17' && <span className="block text-[8px] text-lime-400">HOY</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-800/60 mt-3">
            {lotes?.map((lote) => (
              <div key={lote.id} className="grid grid-cols-12 gap-2 py-4 items-center hover:bg-gray-800/30 rounded-xl px-2 transition">
                <div className="col-span-4 space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{lote.folio_lote}</span>
                    <span className="text-[10px] bg-[#181d29] text-gray-300 border border-[#252c3d] px-2 py-0.5 rounded-full font-semibold">
                      {lote.piezas_completadas} / {lote.piezas_totales} pzs
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white truncate">{lote.producto}</div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>Área: <strong className="text-gray-200">{lote.area_asignada}</strong></span>
                  </div>
                </div>

                <div className="col-span-8 grid grid-cols-9 gap-1 items-center relative py-1">
                  <div className="col-span-9 bg-[#181d29] h-9 rounded-xl border border-[#252c3d] relative overflow-hidden flex items-center px-3">
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-xl ${getStageColor(lote.etapa_actual)}`}
                      style={{ width: `${lote.porcentaje_avance}%` }}
                    />
                    <div className="relative z-10 flex justify-between items-center w-full text-xs font-mono font-bold drop-shadow">
                      <span className="flex items-center gap-1 text-white">
                        {getStageIcon(lote.etapa_actual)}
                        <span>{lote.etapa_actual}</span>
                      </span>
                      <span className="text-white">{lote.porcentaje_avance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};