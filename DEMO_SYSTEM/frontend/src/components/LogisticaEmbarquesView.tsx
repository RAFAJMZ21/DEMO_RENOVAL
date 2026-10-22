import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmbarquesDespacho } from '../api/logistica';
import { MOCK_EMBARQUES } from '../api/demoMocks';
import type { EmbarqueDespacho } from '../types';
import { Truck, CheckCircle2, Clock, PackageCheck } from 'lucide-react';

const chipEstatus = (estatus: EmbarqueDespacho['estatus']): string => {
  switch (estatus) {
    case 'EN_TRANSITO':
      return 'bg-blue-950/70 text-blue-300 border border-blue-800';
    case 'ENTREGADO':
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800';
    default:
      return 'bg-amber-950/70 text-amber-400 border border-amber-800';
  }
};

const etiquetaEstatus = (estatus: EmbarqueDespacho['estatus']): string =>
  estatus === 'EN_TRANSITO' ? 'En Tránsito' : estatus === 'ENTREGADO' ? 'Entregado' : 'Programado';

const iconoEstatus = (estatus: EmbarqueDespacho['estatus']): React.ReactNode => {
  if (estatus === 'ENTREGADO') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (estatus === 'EN_TRANSITO') return <Truck className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
};

export const LogisticaEmbarquesView: React.FC = () => {
  // initialData: arranca con datos del Modo Demo y nunca queda en undefined/vacío.
  const { data, isFetching } = useQuery({
    queryKey: ['embarques-despacho'],
    queryFn: getEmbarquesDespacho,
    initialData: MOCK_EMBARQUES,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const embarquesLista = data ?? MOCK_EMBARQUES;

  const programados = embarquesLista.filter((e) => e.estatus === 'PROGRAMADO').length;
  const enTransito = embarquesLista.filter((e) => e.estatus === 'EN_TRANSITO').length;
  const entregados = embarquesLista.filter((e) => e.estatus === 'ENTREGADO').length;

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400 relative">
            <Truck className="w-7 h-7" />
            {isFetching && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">Embarques, Salidas & Remisiones</h2>
            <p className="text-xs text-gray-400">Programación de transportes, choferes y remisiones de entrega a clientes.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-[#181d29] border border-[#252c3d] rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] text-gray-400">PROGRAMADOS</div>
            <div className="text-xl font-black text-amber-400">{programados}</div>
          </div>
          <div className="bg-[#181d29] border border-[#252c3d] rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] text-gray-400">EN TRÁNSITO</div>
            <div className="text-xl font-black text-blue-300">{enTransito}</div>
          </div>
          <div className="bg-[#181d29] border border-[#252c3d] rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] text-gray-400">ENTREGADOS</div>
            <div className="text-xl font-black text-emerald-400">{entregados}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-emerald-400" /> Embarques Registrados
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                <th className="p-3">Folio Salida</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Destino</th>
                <th className="p-3">Chofer / Placas</th>
                <th className="p-3">Tarimas</th>
                <th className="p-3">Despacho</th>
                <th className="p-3">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {embarquesLista.map((embarque) => (
                <tr key={embarque.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{embarque.folio_embarque}</td>
                  <td className="p-3 font-bold">{embarque.cliente}</td>
                  <td className="p-3 text-gray-300">{embarque.destino}</td>
                  <td className="p-3 text-gray-300">
                    {embarque.chofer}
                    <span className="block text-[10px] text-gray-500 font-mono">{embarque.placas_trailer}</span>
                  </td>
                  <td className="p-3 font-mono">{embarque.tarimas_cargadas.toLocaleString('es-MX')} pzs</td>
                  <td className="p-3 text-gray-400">{embarque.fecha_despacho}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${chipEstatus(embarque.estatus)}`}>
                      {iconoEstatus(embarque.estatus)} {etiquetaEstatus(embarque.estatus)}
                    </span>
                  </td>
                </tr>
              ))}
              {embarquesLista.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 text-xs">
                    No hay embarques programados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};