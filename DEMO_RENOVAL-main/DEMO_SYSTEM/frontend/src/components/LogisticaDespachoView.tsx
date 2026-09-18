import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';

export const LogisticaDespachoView: React.FC = () => {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Truck className="w-6 h-6 text-emerald-400" /> Despacho, Embarques & Tractocamiones
        </h2>
        <p className="text-xs text-gray-400">Programación de transportes, choferes y remisiones de entrega a clientes.</p>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181d29] text-gray-400 text-xs">
            <tr>
              <th className="p-3">Folio Embarque</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Chofer / Placas</th>
              <th className="p-3">Tarimas</th>
              <th className="p-3">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="p-3 font-mono text-emerald-400 font-bold">EMB-2026-881</td>
              <td className="p-3 font-bold">Logística & Embalajes del Valle</td>
              <td className="p-3 text-gray-300">Carlos Mendoza (77-AB-9X)</td>
              <td className="p-3 font-mono">600 pzs</td>
              <td className="p-3"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> En Tránsito</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};