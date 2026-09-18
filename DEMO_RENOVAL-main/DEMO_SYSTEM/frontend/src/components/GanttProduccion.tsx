import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduccionGantt } from '../api/modulos';
import { Calendar, CheckCircle2, Flame, Hammer, Loader2 } from 'lucide-react';

export const GanttProduccion: React.FC = () => {
  const { data: lotes, isLoading, isFetching } = useQuery({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    refetchInterval: 30000, // Actualiza cada 30 segundos en segundo plano
    staleTime: 10000,       // Considera los datos frescos por 10 segundos
  });

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

  // SOLO muestra pantalla completa de carga si NO hay datos previos cargados
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
      {/* Header del Módulo */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            <h2 className="text-xl font-bold flex items-center gap-2">
              Control de Producción & Diagrama de Gantt Interactivo
              {isFetching && <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Sincronizando...</span>}
            </h2>
            <p className="text-xs text-gray-400">Programación de lotes de tarimas, avance por fases y trazabilidad fitosanitaria.</p>
          </div>
        </div>

        {/* Leyenda de Estados */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
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

      {/* Contenedor Principal del Gantt */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] overflow-x-auto">
        <div className="min-w-[850px]">
          
          {/* Cabecera del Timeline */}
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

          {/* Filas de Lotes */}
          <div className="divide-y divide-gray-800/60 mt-3">
            {lotes?.map((lote) => (
              <div key={lote.id} className="grid grid-cols-12 gap-2 py-4 items-center hover:bg-gray-800/30 rounded-xl px-2 transition">
                
                {/* Info Lote */}
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

                {/* Timeline Gantt Row */}
                <div className="col-span-8 grid grid-cols-9 gap-1 items-center relative py-1">
                  <div className="col-span-9 bg-[#181d29] h-9 rounded-xl border border-[#252c3d] relative overflow-hidden flex items-center px-3">
                    
                    {/* Barra de Progreso Interna */}
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-xl ${
                        lote.etapa_actual === 'HT_FITOSANITARIO' 
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500' 
                          : lote.etapa_actual === 'EMBARQUE'
                          ? 'bg-gradient-to-r from-emerald-600 to-lime-500'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                      }`}
                      style={{ width: `${lote.porcentaje_avance}%` }}
                    />

                    {/* Texto sobre la barra */}
                    <div className="relative z-10 flex justify-between items-center w-full text-xs font-mono font-bold drop-shadow">
                      <span className="flex items-center gap-1 text-white">
                        {lote.etapa_actual === 'HT_FITOSANITARIO' && <Flame className="w-3.5 h-3.5 text-amber-200" />}
                        {lote.etapa_actual === 'ARMADO' && <Hammer className="w-3.5 h-3.5 text-cyan-200" />}
                        {lote.etapa_actual === 'EMBARQUE' && <CheckCircle2 className="w-3.5 h-3.5 text-lime-200" />}
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