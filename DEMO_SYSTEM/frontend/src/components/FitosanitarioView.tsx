import React from 'react';
import { Flame, CheckCircle, ShieldAlert, Thermometer, Clock } from 'lucide-react';

export const FitosanitarioView: React.FC = () => {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-7 h-7 text-amber-500" />
          <div>
            <h2 className="text-xl font-bold">Módulo de Tratamiento Térmico Fitosanitario (HT NOM-144-SEMARNAT)</h2>
            <p className="text-xs text-gray-400">Monitoreo térmico en cámaras de secado: 56°C en el centro de la madera por 30 minutos mínimos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex items-center gap-4">
            <Thermometer className="w-8 h-8 text-rose-400" />
            <div>
              <div className="text-xs text-gray-400">TEMPERATURA NÚCLEO</div>
              <div className="text-2xl font-black text-rose-400">58.4 °C</div>
              <span className="text-[10px] text-emerald-400 font-bold">✓ Cumple Norma NOM-144</span>
            </div>
          </div>

          <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex items-center gap-4">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-xs text-gray-400">TIEMPO TRANSCURRIDO</div>
              <div className="text-2xl font-black text-amber-400">42 min</div>
              <span className="text-[10px] text-gray-400">Fase de sostenimiento activo</span>
            </div>
          </div>

          <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-xs text-gray-400">SELLO AUTORIZADO</div>
              <div className="text-lg font-black text-emerald-400">MX - 144 HT</div>
              <span className="text-[10px] text-gray-400">Registro SEMARNAT Vigente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-lime-400" /> Cámaras y Hornos de Estufado Activos
        </h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181d29] text-gray-400 text-xs">
            <tr>
              <th className="p-3">Cámara / Horno</th>
              <th className="p-3">Lote Asignado</th>
              <th className="p-3">Capacidad</th>
              <th className="p-3">Estatus</th>
              <th className="p-3">Certificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="p-3 font-bold text-white">Horno Estufado HT-01</td>
              <td className="p-3 text-emerald-400 font-mono">LOT-2026-001</td>
              <td className="p-3">1,200 tarimas</td>
              <td className="p-3"><span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold">En Tratamiento (58°C)</span></td>
              <td className="p-3 text-gray-400">Generando lectura...</td>
            </tr>
            <tr>
              <td className="p-3 font-bold text-white">Horno Estufado HT-02</td>
              <td className="p-3 text-gray-400">Disponible</td>
              <td className="p-3">1,500 tarimas</td>
              <td className="p-3"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">Listo para Carga</span></td>
              <td className="p-3 text-gray-400">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};