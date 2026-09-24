import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarViajesLogistica } from '../api/logistica';
import type { ViajeLogisticaDetalle } from '../types';
import {
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Loader2,
  Route,
  Package,
} from 'lucide-react';

const formatMoney = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const formatFecha = (fecha: string) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const estadoStyles: Record<string, string> = {
  Pendiente: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  'En Tránsito': 'bg-sky-950/60 text-sky-400 border-sky-800/50',
  Completado: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  Rechazado: 'bg-red-950/60 text-red-400 border-red-800/50',
};

interface PanelOperadorViewProps {
  onNuevoViaje: () => void;
  onVerEmbarques: () => void;
}

export const PanelOperadorView: React.FC<PanelOperadorViewProps> = ({
  onNuevoViaje,
  onVerEmbarques,
}) => {
  const { data: viajes, isLoading } = useQuery({
    queryKey: ['viajes-logistica'],
    queryFn: listarViajesLogistica,
    refetchInterval: 30000,
  });

  const kpis = useMemo(() => {
    const total = viajes?.length ?? 0;
    const pendientes = viajes?.filter((v) => v.estado === 'Pendiente').length ?? 0;
    const enTransito = viajes?.filter((v) => v.estado === 'En Tránsito').length ?? 0;
    const completados = viajes?.filter((v) => v.estado === 'Completado').length ?? 0;
    return { total, pendientes, enTransito, completados };
  }, [viajes]);

  const ultimosViajes: ViajeLogisticaDetalle[] = useMemo(
    () => (viajes ? [...viajes].sort((a, b) => b.id - a.id).slice(0, 3) : []),
    [viajes]
  );

  const tarimasTotales = useMemo(
    () => (viajes ?? []).reduce((acc, v) => acc + v.cantidad_tarimas, 0),
    [viajes]
  );

  return (
    <div className="space-y-6">
      {/* Encabezado de bienvenida */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-amber-950/30">
        <div>
          <h3 className="text-2xl font-black">Panel Principal de Operador</h3>
          <p className="text-amber-100 text-sm mt-1">
            Resumen de tus viajes de transporte en tiempo real desde MySQL.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onNuevoViaje}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-lime-400 text-amber-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-lime-300 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Viaje</span>
          </button>
          <button
            onClick={onVerEmbarques}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white/15 border border-white/30 font-bold px-5 py-2.5 rounded-xl hover:bg-white/25 transition"
          >
            <Route className="w-5 h-5" />
            <span>Mis Embarques</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 text-amber-400">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Cargando indicadores de transporte...</span>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>VIAJES TOTALES / SOLICITADOS</span>
              </div>
              <div className="text-4xl font-black text-amber-400 mt-2">
                {kpis.total}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {tarimasTotales.toLocaleString()} tarimas en total
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>PENDIENTES DE APROBACIÓN</span>
              </div>
              <div className="text-4xl font-black text-amber-400 mt-2">
                {kpis.pendientes}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Esperando visto bueno del Administrador
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>VIAJES EN TRÁNSITO</span>
              </div>
              <div className="text-4xl font-black text-sky-400 mt-2">
                {kpis.enTransito}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Unidades en ruta
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>VIAJES COMPLETADOS</span>
              </div>
              <div className="text-4xl font-black text-emerald-400 mt-2">
                {kpis.completados}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Entregas cerradas
              </div>
            </div>
          </div>

          {/* Últimos 3 viajes */}
          <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">
              ÚLTIMOS VIAJES REGISTRADOS
            </h4>
            {ultimosViajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Package className="w-10 h-10 mb-2" />
                <p className="text-sm">Aún no has registrado viajes.</p>
                <button
                  onClick={onNuevoViaje}
                  className="mt-3 flex items-center gap-2 bg-lime-400 text-amber-950 font-extrabold px-4 py-2 rounded-xl hover:bg-lime-300 transition"
                >
                  <Plus className="w-4 h-4" />
                  Registrar el primero
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ultimosViajes.map((viaje) => (
                  <div
                    key={viaje.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-[#252c3d] bg-[#181d29]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                        {viaje.id}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          Viaje #{viaje.id} — {viaje.destino}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {viaje.empresa} • {viaje.municipio} • {viaje.kilometros} km
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full border font-bold ${estadoStyles[viaje.estado] ?? ''}`}
                      >
                        {viaje.estado}
                      </span>
                      <span className="text-gray-300 whitespace-nowrap">
                        {viaje.cantidad_tarimas} tarimas
                      </span>
                      <span className="text-emerald-400 font-bold whitespace-nowrap">
                        {formatMoney(viaje.costo_total_flete ?? 0)}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 md:text-right">
                      Sale: {formatFecha(viaje.fecha_salida)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};