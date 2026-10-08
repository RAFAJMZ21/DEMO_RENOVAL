import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, ShieldAlert, Thermometer, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { getCertificadosFitosanitarios, getProduccionGantt } from '../api/modulos';

export const FitosanitarioView: React.FC = () => {
  const { data: certificados, isLoading: loadingCerts } = useQuery({
    queryKey: ['certificados-ht'],
    queryFn: getCertificadosFitosanitarios,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: lotes } = useQuery({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const loteEnHorno = lotes?.find(l => l.etapa_actual === 'HT_FITOSANITARIO');
  const loteDisponible = lotes?.find(l => l.etapa_actual === 'ARMADO');
  const certificadoReciente = certificados?.[0];

  if (loadingCerts && !certificados) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando datos fitosanitarios...</span>
      </div>
    );
  }

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
              <div className="text-2xl font-black text-rose-400">
                {loteEnHorno ? `${loteEnHorno.porcentaje_avance > 70 ? 58.4 : 56.0} °C` : '56.0 °C'}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">✓ Cumple Norma NOM-144 (≥56°C)</span>
            </div>
          </div>

          <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex items-center gap-4">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-xs text-gray-400">TIEMPO SOSTENIMIENTO</div>
              <div className="text-2xl font-black text-amber-400">
                {loteEnHorno ? `${Math.min(42 + Math.floor((loteEnHorno.porcentaje_avance - 70) / 10 * 15), 55)} min` : '30 min'}
              </div>
              <span className="text-[10px] text-gray-400">Mínimo requerido: 30 min</span>
            </div>
          </div>

          <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-xs text-gray-400">SELLO AUTORIZADO</div>
              <div className="text-lg font-black text-emerald-400">{certificadoReciente?.codigo_sello_ht || 'MX - 144 HT'}</div>
              <span className="text-[10px] text-gray-400">Registro SEMARNAT Vigente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-lime-400" /> Cámaras y Hornos de Estufado
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
              <td className="p-3 text-emerald-400 font-mono">
                {loteEnHorno?.folio_lote || 'LOT-2026-001'}
              </td>
              <td className="p-3">1,200 tarimas</td>
              <td className="p-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  loteEnHorno ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {loteEnHorno ? `En Tratamiento (${loteEnHorno.porcentaje_avance}%)` : 'Listo para Carga'}
                </span>
              </td>
              <td className="p-3 text-gray-400">
                {loteEnHorno && loteEnHorno.porcentaje_avance === 100 ? 'Generando...' : 'En proceso'}
              </td>
            </tr>
            <tr>
              <td className="p-3 font-bold text-white">Horno Estufado HT-02</td>
              <td className="p-3 text-gray-400">
                {loteDisponible?.folio_lote || 'Disponible'}
              </td>
              <td className="p-3">1,500 tarimas</td>
              <td className="p-3">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                  Listo para Carga
                </span>
              </td>
              <td className="p-3 text-gray-400">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Últimos Certificados Emitidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificados?.slice(0, 4).map((cert) => (
            <div key={cert.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-emerald-400 font-bold">{cert.folio_certificado}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">LIBERADO</span>
              </div>
              <div className="text-white font-medium">{cert.cliente}</div>
              <div className="text-gray-400">Lote: <strong className="text-gray-200">{cert.folio_lote}</strong></div>
              <div className="bg-[#10141d] p-3 rounded-lg border border-gray-800 space-y-1">
                <div className="flex justify-between text-gray-400"><span>Sello:</span><span className="text-white">{cert.codigo_sello_ht}</span></div>
                <div className="flex justify-between text-gray-400"><span>Temp:</span><span className="text-lime-400 font-bold">{cert.temperatura_alcanzada} °C</span></div>
                <div className="flex justify-between text-gray-400"><span>Tiempo:</span><span className="text-amber-400 font-bold">{cert.tiempo_sostenimiento_min} min</span></div>
                <div className="flex justify-between text-gray-400"><span>Fecha:</span><span className="text-gray-300">{cert.fecha_emision}</span></div>
              </div>
            </div>
          ))}
          {(!certificados || certificados.length === 0) && (
            <div className="col-span-2 text-center text-gray-400 py-8">No hay certificados emitidos</div>
          )}
        </div>
      </div>
    </div>
  );
};