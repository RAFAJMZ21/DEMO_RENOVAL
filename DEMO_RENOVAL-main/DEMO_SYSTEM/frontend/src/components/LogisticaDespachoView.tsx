import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, CheckCircle2, Loader2, MapPin, Calendar } from 'lucide-react';
import { getEmbarquesDespacho, getFletesDestino } from '../api/modulos';

export const LogisticaDespachoView: React.FC = () => {
  const { data: embarques, isLoading: loadingEmbarques, isFetching: fetchingEmbarques } = useQuery({
    queryKey: ['embarques-despacho'],
    queryFn: getEmbarquesDespacho,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: fletes } = useQuery({
    queryKey: ['fletes-destino'],
    queryFn: getFletesDestino,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const getEstatusBadge = (estatus: string) => {
    switch (estatus) {
      case 'EN_TRANSITO':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> En Tránsito</span>;
      case 'ENTREGADO':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Entregado</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">{estatus}</span>;
    }
  };

  if (loadingEmbarques && !embarques) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando embarques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Despacho, Embarques & Tractocamiones</h2>
            <p className="text-xs text-gray-400">Programación de transportes, choferes y remisiones de entrega a clientes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fetchingEmbarques && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181d29] text-gray-400 text-xs">
            <tr>
              <th className="p-3">Folio Embarque</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Chofer / Placas</th>
              <th className="p-3">Tarimas</th>
              <th className="p-3">Fecha Despacho</th>
              <th className="p-3">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {embarques?.map((emb) => (
              <tr key={emb.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-3 font-mono text-emerald-400 font-bold">{emb.folio_embarque}</td>
                <td className="p-3 font-bold">{emb.cliente}</td>
                <td className="p-3 text-gray-300 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  <span>{emb.chofer} ({emb.placas_trailer})</span>
                </td>
                <td className="p-3 font-mono">{emb.tarimas_cargadas} pzs</td>
                <td className="p-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-mono text-xs">{emb.fecha_despacho}</span>
                </td>
                <td className="p-3">{getEstatusBadge(emb.estatus)}</td>
              </tr>
            ))}
            {(!embarques || embarques.length === 0) && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">No hay embarques registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {fletes && fletes.length > 0 && (
        <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" /> Matriz de Fletes - Costos por Destino
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181d29] text-gray-400 text-xs">
                <tr>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Municipio</th>
                  <th className="p-3">Distancia (km)</th>
                  <th className="p-3">Precio Flete</th>
                  <th className="p-3">Capacidad (pzs)</th>
                  <th className="p-3">Costo Unitario / Tarima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {fletes.map((f, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-3 font-bold">{f.estado}</td>
                    <td className="p-3">{f.municipio}</td>
                    <td className="p-3 font-mono text-gray-300">{f.km} km</td>
                    <td className="p-3 font-bold text-amber-400">${f.precio_flete.toLocaleString()}</td>
                    <td className="p-3 font-mono">{f.capacidad} pzs</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">${f.costo_tarima_unitario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};