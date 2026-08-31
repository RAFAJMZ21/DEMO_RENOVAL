import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduccionGantt } from '../api/modulos';
import { Calendar } from 'lucide-react';

export const GanttProduccion: React.FC = () => {
  const { data: lotes, isLoading } = useQuery({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
  });

  if (isLoading) return <div className="p-6 text-emerald-400">Cargando Diagrama de Gantt...</div>;

  return (
    <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] text-white">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold">Producción de Tarimas al Día (Diagrama de Gantt)</h2>
      </div>

      <div className="space-y-6">
        {lotes?.map((lote) => (
          <div key={lote.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-emerald-400">{lote.folio_lote}</span>
                <h3 className="text-md font-semibold">{lote.producto}</h3>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                {lote.etapa_actual}
              </span>
            </div>

            <div className="text-xs text-gray-400 flex justify-between mb-2">
              <span>Área: {lote.area_asignada}</span>
              <span>{lote.piezas_completadas} / {lote.piezas_totales} pzs ({lote.porcentaje_avance}%)</span>
            </div>

            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full transition-all duration-500"
                style={{ width: `${lote.porcentaje_avance}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-gray-500 mt-2">
              <span>Inicio: {lote.fecha_inicio}</span>
              <span>Fin Estimado: {lote.fecha_fin_estimada}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};