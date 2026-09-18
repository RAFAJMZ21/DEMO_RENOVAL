import React from 'react';
import { Layers } from 'lucide-react';

export const InsumosClavadoView: React.FC = () => {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-amber-400" /> Control de Insumos & Clavado
        </h2>
        <p className="text-xs text-gray-400">Stock en tiempo real de clavos en rollo, grapas y pintura de marcado por línea.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Clavo Espiral 2 1/2"</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">Rollo</span>
          </div>
          <div className="text-2xl font-black text-white">1,200 kg</div>
          <div className="text-xs text-gray-400">Asignado: Línea A de Clavado</div>
        </div>

        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Clavo Estándar 3"</span>
            <span className="text-xs bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-mono">Bajo Stock</span>
          </div>
          <div className="text-2xl font-black text-amber-400">250 kg</div>
          <div className="text-xs text-gray-400">Asignado: Línea B de Clavado</div>
        </div>
      </div>
    </div>
  );
};