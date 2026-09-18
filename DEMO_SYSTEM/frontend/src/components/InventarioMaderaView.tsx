import React from 'react';
import { Boxes, Plus, AlertCircle } from 'lucide-react';

export const InventarioMaderaView: React.FC = () => {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" /> Inventario & Cubaje de Madera (Pies Tablares)
          </h2>
          <p className="text-xs text-gray-400">Control de trozas y tablas de pino. Fórmula: (Ancho x Grueso x Largo) / 144.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Registrar Entrada Madera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">STOCK MADERA VERDE</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">450 m³</div>
          <span className="text-[10px] text-gray-400">~190,800 Pies Tablares</span>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">ESTUFADA LISTA (HT)</span>
          <div className="text-2xl font-black text-lime-400 mt-1">125 m³</div>
          <span className="text-[10px] text-gray-400">Listas para armado</span>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">PUNTO REORDEN</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
            <span>OK</span> <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-gray-400">Abastecimiento normal</span>
        </div>
      </div>
    </div>
  );
};