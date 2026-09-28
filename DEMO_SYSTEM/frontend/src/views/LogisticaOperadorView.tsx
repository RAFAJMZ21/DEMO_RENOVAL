import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarTarifasFletes, crearViajeLogistica, listarViajesLogistica } from '../api/logistica';
import type { FleteTarifa, ViajeLogisticaCreate } from '../types';
import { Truck, Loader2, Plus, Search, MapPin, CheckCircle2, AlertCircle, Boxes, Route } from 'lucide-react';

const formatMoney = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const estadoStyles: Record<string, string> = {
  Pendiente: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  'En Tránsito': 'bg-sky-950/60 text-sky-400 border-sky-800/50',
  Completado: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  Rechazado: 'bg-red-950/60 text-red-400 border-red-800/50',
};

export const LogisticaOperadorView: React.FC = () => {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [tarifaId, setTarifaId] = useState<number>(0);
  const [unidad, setUnidad] = useState('');
  const [cantidadTarimas, setCantidadTarimas] = useState<number>(50);
  const [folioCotizacion, setFolioCotizacion] = useState<string>('');
  const [fechaSalida, setFechaSalida] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string>('');

  const { data: tarifas, isLoading: cargandoTarifas } = useQuery({
    queryKey: ['tarifas-fletes'],
    queryFn: listarTarifasFletes,
  });

  const { data: viajes, isLoading: cargandoViajes } = useQuery({
    queryKey: ['viajes-logistica'],
    queryFn: listarViajesLogistica,
  });

  const tarifasFiltradas = useMemo(() => {
    if (!tarifas) return [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return tarifas;
    return tarifas.filter(
      (t) =>
        t.municipio.toLowerCase().includes(q) ||
        t.estado.toLowerCase().includes(q) ||
        t.empresa.toLowerCase().includes(q)
    );
  }, [tarifas, busqueda]);

  const tarifaSeleccionada: FleteTarifa | undefined = useMemo(
    () => tarifas?.find((t) => t.id === tarifaId),
    [tarifas, tarifaId]
  );

  const costoEstimado = useMemo(() => {
    if (!tarifaSeleccionada || cantidadTarimas <= 0) return 0;
    const sobreCapacidad = cantidadTarimas > tarifaSeleccionada.capacidad_tarimas;
    const unitario = sobreCapacidad
      ? tarifaSeleccionada.precio_reducido || 0
      : tarifaSeleccionada.precio_unitario || 0;
    return cantidadTarimas * unitario;
  }, [tarifaSeleccionada, cantidadTarimas]);

  const guardarMutation = useMutation({
    mutationFn: crearViajeLogistica,
    onSuccess: (viaje) => {
      queryClient.invalidateQueries({ queryKey: ['viajes-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['viajes-pendientes'] });
      setMensajeExito(
        `Viaje #${viaje.id} registrado a ${viaje.destino}. Costo estimado: ${formatMoney(viaje.costo_total_flete)}`
      );
      setMensajeError('');
      setUnidad('');
      setCantidadTarimas(50);
      setFolioCotizacion('');
    },
    onError: (err) => {
      setMensajeError(`Error al registrar el viaje: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setMensajeExito('');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    if (!tarifaId) {
      setMensajeError('Selecciona un destino de la matriz de tarifas.');
      return;
    }
    if (!unidad.trim()) {
      setMensajeError('Captura la unidad de transporte.');
      return;
    }
    const payload: ViajeLogisticaCreate = {
      tarifa_id: tarifaId,
      unidad: unidad.trim(),
      cantidad_tarimas: cantidadTarimas,
      fecha_salida: fechaSalida || undefined,
      folio_cotizacion_id: folioCotizacion.trim() ? Number(folioCotizacion) : null,
    };
    guardarMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Solicitud de Viaje — Operador</h2>
            <p className="text-xs text-gray-400">
              El chofer selecciona el destino, la unidad y la cantidad de tarimas. El costo se calcula con la matriz de fletes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#181d29] p-5 rounded-xl border border-[#252c3d] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
            <Plus className="w-4 h-4" /> Nueva Solicitud de Flete
          </div>

          {/* Búsqueda/Autocompletado de destino */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
              <Search className="w-3.5 h-3.5 text-amber-400" /> Buscar Destino (autocompletar)
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Municipio, estado o empresa de transporte..."
              className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-400 font-semibold">Destino / Tarifa</label>
              <select
                value={tarifaId}
                onChange={(e) => setTarifaId(Number(e.target.value))}
                disabled={cargandoTarifas}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value={0} className="bg-[#10141d]">
                  {cargandoTarifas ? 'Cargando destinos...' : '— Selecciona un destino —'}
                </option>
                {tarifasFiltradas.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#10141d]">
                    {t.municipio} ({t.estado}) — {formatMoney(t.precio_unitario)}/tarima
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold">Unidad de Transporte</label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="Ej. T1 — Kenworth T800"
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                <Boxes className="w-3.5 h-3.5 text-amber-400" /> Cantidad de Tarimas
              </label>
              <input
                type="number"
                min={1}
                value={cantidadTarimas}
                onChange={(e) => setCantidadTarimas(Math.max(1, Number(e.target.value)))}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono font-semibold outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold">Folio Cotización (opcional)</label>
              <input
                type="number"
                min={1}
                value={folioCotizacion}
                onChange={(e) => setFolioCotizacion(e.target.value)}
                placeholder="ID de cotización"
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold">Fecha de Salida</label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Resumen de la tarifa seleccionada + cálculo en vivo */}
          {tarifaSeleccionada ? (
            <div className="mt-4 bg-[#10141d] border border-[#252c3d] rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-3">
                <MapPin className="w-4 h-4" /> {tarifaSeleccionada.municipio}, {tarifaSeleccionada.estado}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">DISTANCIA</span>
                  <div className="text-lg font-black text-white mt-0.5">{tarifaSeleccionada.kilometros} km</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">FLETE COMPLETO</span>
                  <div className="text-lg font-black text-white mt-0.5">{formatMoney(tarifaSeleccionada.precio_flete)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">COSTO / KM</span>
                  <div className="text-lg font-black text-gray-200 mt-0.5">{formatMoney(tarifaSeleccionada.costo_km)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">CAPACIDAD</span>
                  <div className="text-lg font-black text-gray-200 mt-0.5">{tarifaSeleccionada.capacidad_tarimas} tarimas</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">PRECIO UNITARIO</span>
                  <div className="text-lg font-black text-amber-400 mt-0.5">{formatMoney(tarifaSeleccionada.precio_unitario)}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#252c3d] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Route className="w-4 h-4 text-emerald-400" />
                  {cantidadTarimas > tarifaSeleccionada.capacidad_tarimas
                    ? `Excede capacidad (aplica precio reducido ${formatMoney(tarifaSeleccionada.precio_reducido)}/tarima)`
                    : 'Dentro de capacidad (precio unitario estándar)'}
                </span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">COSTO ESTIMADO DEL FLETE</span>
                  <div className="text-2xl font-black text-lime-400">{formatMoney(costoEstimado)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-[#10141d] border border-[#252c3d] rounded-xl p-4 text-xs text-gray-500">
              Selecciona un destino para ver el detalle de la tarifa y el costo estimado.
            </div>
          )}

          <button
            type="submit"
            disabled={guardarMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
          >
            {guardarMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            Registrar Solicitud de Viaje
          </button>
          {mensajeExito && (
            <p className="text-xs text-emerald-400 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {mensajeExito}
            </p>
          )}
          {mensajeError && (
            <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" /> {mensajeError}
            </p>
          )}
        </form>
      </div>

      {/* Historial de viajes solicitados */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" /> Viajes Solicitados
        </h3>
        {cargandoViajes ? (
          <div className="flex justify-center items-center py-10 text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando viajes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181d29] text-gray-400 text-xs">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Unidad</th>
                  <th className="p-3">Tarimas</th>
                  <th className="p-3">Costo Flete</th>
                  <th className="p-3">Fecha Salida</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {viajes?.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-3 font-mono text-amber-400 font-bold">#{v.id}</td>
                    <td className="p-3 font-bold">{v.destino}</td>
                    <td className="p-3 text-gray-300">{v.unidad || '—'}</td>
                    <td className="p-3 font-mono">{v.cantidad_tarimas}</td>
                    <td className="p-3 font-mono font-bold text-lime-400">{formatMoney(v.costo_total_flete)}</td>
                    <td className="p-3 text-gray-400">{v.fecha_salida}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${estadoStyles[v.estado]}`}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {viajes?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 text-xs">
                      Aún no se han registrado viajes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};