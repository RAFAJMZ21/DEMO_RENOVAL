import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInsumosClavado } from '../api/modulos';
import type { InsumoClavado } from '../types';
import { Layers, Loader2, AlertTriangle, CheckCircle2, PackageSearch } from 'lucide-react';

const ETIQUETAS_TIPO: Record<InsumoClavado['tipo'], string> = {
  CLAVO_ESPIRAL: 'Clavo Espiral',
  GRAPA: 'Grapa',
  ESQUINERO: 'Esquinero',
  PINTURA: 'Pintura',
};

export const InsumosClavadoView: React.FC = () => {
  const { data: insumos, isLoading } = useQuery({
    queryKey: ['insumos-clavado'],
    queryFn: getInsumosClavado,
  });

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-amber-400" /> Control de Insumos & Clavado
        </h2>
        <p className="text-xs text-gray-400">Stock en tiempo real de clavos en rollo, grapas y pintura de marcado por línea.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 text-emerald-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando existencias de insumos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {insumos?.map((insumo) => {
            const bajoStock = insumo.existencia_kg < insumo.stock_minimo_kg;
            return (
              <div
                key={insumo.id}
                className={`bg-[#181d29] p-4 rounded-xl border space-y-2 ${
                  bajoStock ? 'border-amber-700/60' : 'border-[#252c3d]'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-sm">{insumo.descripcion}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{insumo.codigo}</div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${
                      bajoStock ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {ETIQUETAS_TIPO[insumo.tipo] ?? insumo.tipo}
                  </span>
                </div>

                <div className={`text-2xl font-black ${bajoStock ? 'text-amber-400' : 'text-white'}`}>
                  {insumo.existencia_kg.toLocaleString('es-MX')} kg
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Mínimo: <strong className="text-gray-300 font-mono">{insumo.stock_minimo_kg.toLocaleString('es-MX')} kg</strong>
                  </span>
                  <span className="text-gray-400">{insumo.medida}</span>
                </div>

                <div className="border-t border-gray-800 pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Asignado: <strong className="text-gray-200">{insumo.linea_asignada}</strong></span>
                  {bajoStock ? (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Bajo stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Óptimo
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {insumos?.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
              <PackageSearch className="w-8 h-8" />
              No hay insumos registrados en almacén.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
