import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarViajesPendientes,
  aprobarViaje,
  listarTarifasFletes,
  crearTarifaFlete,
  actualizarTarifaFlete,
  eliminarTarifaFlete,
} from '../api/logistica';
import type { EstadoViaje, FleteTarifa } from '../types';
import {
  ClipboardCheck,
  Loader2,
  CheckCircle2,
XCircle,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Save,
  TrendingUp,
} from 'lucide-react';

const formatMoney = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const emptyTarifa = (): Omit<FleteTarifa, 'id'> => ({
  estado: '',
  municipio: '',
  empresa: 'Transportes RENOVAL',
  kilometros: 0,
  precio_flete: 0,
  costo_km: 0,
  capacidad_tarimas: 0,
  precio_unitario: 0,
  precio_reducido: 0,
});

export const LogisticaAdminView: React.FC = () => {
  const queryClient = useQueryClient();

  const [formTarifa, setFormTarifa] = useState<Omit<FleteTarifa, 'id'>>(emptyTarifa());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensajeError, setMensajeError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');

  // Pendientes en tiempo real: actualiza cada 8s + badge de contador
  const { data: pendientes, isLoading: cargandoPendientes, isFetching } = useQuery({
    queryKey: ['viajes-pendientes'],
    queryFn: listarViajesPendientes,
    refetchInterval: 8000,
    staleTime: 3000,
  });

  const { data: tarifas, isLoading: cargandoTarifas } = useQuery({
    queryKey: ['tarifas-fletes'],
    queryFn: listarTarifasFletes,
  });

  const aprobarMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoViaje }) => aprobarViaje(id, estado),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['viajes-pendientes'] }),
  });

  const tarifaMutation = useMutation({
    mutationFn: (data: Omit<FleteTarifa, 'id'> & { id?: number }) =>
      data.id ? actualizarTarifaFlete(data.id, data) : crearTarifaFlete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-fletes'] });
      setFormTarifa(emptyTarifa());
      setEditandoId(null);
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarTarifaFlete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-fletes'] }),
  });

  // Cálculo automático de costo por km y precio unitario (mismo criterio que el backend)
  const costoSugerido = useMemo(() => {
    const km = Math.max(0, Number(formTarifa.kilometros) || 0);
    const flete = Math.max(0, Number(formTarifa.precio_flete) || 0);
    const capacidad = Math.max(1, Number(formTarifa.capacidad_tarimas) || 1);
    const costoKm = km > 0 ? flete / km : 0;
    const unitario = flete / capacidad;
    return { costoKm, unitario, reducido: unitario * 0.95 };
  }, [formTarifa.kilometros, formTarifa.precio_flete, formTarifa.capacidad_tarimas]);

  const handleChangeTarifa = (campo: keyof Omit<FleteTarifa, 'id'>, valor: string | number) => {
    setFormTarifa((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmitTarifa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');
    if (!formTarifa.municipio.trim() || !formTarifa.estado.trim()) {
      setMensajeError('Estado y municipio/destino son obligatorios.');
      return;
    }
    const payload = {
      ...formTarifa,
      kilometros: Math.max(0, Number(formTarifa.kilometros) || 0),
      precio_flete: Math.max(0, Number(formTarifa.precio_flete) || 0),
      costo_km: Number(costoSugerido.costoKm.toFixed(2)),
      capacidad_tarimas: Math.max(0, Number(formTarifa.capacidad_tarimas) || 0),
      precio_unitario: Number(costoSugerido.unitario.toFixed(2)),
      precio_reducido: Number(costoSugerido.reducido.toFixed(2)),
    };
    tarifaMutation.mutate(editandoId ? { ...payload, id: editandoId } : payload, {
      onSuccess: () => setMensajeExito(editandoId ? 'Tarifa actualizada correctamente.' : 'Tarifa agregada a la matriz de fletes.'),
      onError: () => setMensajeError('Ocurrió un error al guardar la tarifa.'),
    });
  };

  const editarTarifa = (t: FleteTarifa) => {
    setEditandoId(t.id);
    setFormTarifa({ ...t });
    setMensajeExito('');
    setMensajeError('');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Aprobación de Viajes
              {pendientes && pendientes.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 text-xs font-black">
                  {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
                </span>
              )}
              {isFetching && <span className="text-[10px] text-emerald-400 font-mono">sincronizando...</span>}
            </h2>
            <p className="text-xs text-gray-400">
              Solicitudes del Operador que requieren aprobación. Notificaciones en tiempo real cada 8 segundos.
            </p>
          </div>
        </div>

        {cargandoPendientes ? (
          <div className="flex justify-center items-center py-10 text-emerald-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando solicitudes pendientes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181d29] text-gray-400 text-xs">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Cotización</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Unidad</th>
                  <th className="p-3">Tarimas</th>
                  <th className="p-3">Costo/km</th>
                  <th className="p-3">Costo Flete</th>
                  <th className="p-3">Fecha Salida</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendientes?.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-3 font-mono text-emerald-400 font-bold">#{v.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {v.destino}
                      </div>
                      <div className="text-[10px] text-gray-500">{v.empresa || ''}</div>
                    </td>
                    <td className="p-3 font-mono text-xs">{v.folio_cotizacion || '—'}</td>
                    <td className="p-3">{v.operador_nombre}</td>
                    <td className="p-3 text-gray-300">{v.unidad || '—'}</td>
                    <td className="p-3 font-mono">
                      {v.cantidad_tarimas}
                      <span className="text-[10px] text-gray-500"> / {v.capacidad_tarimas}</span>
                    </td>
                    <td className="p-3 font-mono text-gray-300">{formatMoney(v.costo_km)}</td>
                    <td className="p-3 font-mono font-bold text-lime-400">{formatMoney(v.costo_total_flete)}</td>
                    <td className="p-3 text-gray-400">{v.fecha_salida}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => aprobarMutation.mutate({ id: v.id, estado: 'En Tránsito' })}
                          disabled={aprobarMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/20 border border-emerald-600/50 text-emerald-400 text-xs font-bold hover:bg-emerald-600/40 disabled:opacity-50 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => aprobarMutation.mutate({ id: v.id, estado: 'Rechazado' })}
                          disabled={aprobarMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600/20 border border-red-600/50 text-red-400 text-xs font-bold hover:bg-red-600/40 disabled:opacity-50 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendientes?.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm font-semibold">Sin solicitudes pendientes.</p>
                      <p className="text-xs text-gray-500">El módulo se actualiza automáticamente.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gestor de la Matriz de Precios / Tarifas */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-lime-400" /> Matriz de Precios de Fletes
        </h3>

        <form onSubmit={handleSubmitTarifa} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            {editandoId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editandoId ? `Editando Tarifa #${editandoId}` : 'Agregar Tarifa'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <input
              type="text"
              value={formTarifa.estado}
              onChange={(e) => handleChangeTarifa('estado', e.target.value)}
              placeholder="Estado (CDMX, Edomex...)"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="text"
              value={formTarifa.municipio}
              onChange={(e) => handleChangeTarifa('municipio', e.target.value)}
              placeholder="Municipio / Destino"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="text"
              value={formTarifa.empresa}
              onChange={(e) => handleChangeTarifa('empresa', e.target.value)}
              placeholder="Empresa transportista"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="number"
              min={0}
              value={formTarifa.kilometros || ''}
              onChange={(e) => handleChangeTarifa('kilometros', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="Km"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm font-mono outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="number"
              min={0}
              value={formTarifa.precio_flete || ''}
              onChange={(e) => handleChangeTarifa('precio_flete', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="Precio Flete ($)"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm font-mono outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="number"
              min={0}
              value={formTarifa.capacidad_tarimas || ''}
              onChange={(e) => handleChangeTarifa('capacidad_tarimas', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="Capacidad (tarimas)"
              className="col-span-1 p-2 bg-[#10141d] border border-[#252c3d] rounded-lg text-sm font-mono outline-none focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-gray-400">
                Costo/Km: <b className="text-lime-400 font-mono">{formatMoney(costoSugerido.costoKm)}</b>
              </span>
              <span className="text-gray-400">
                P. Unitario: <b className="text-white font-mono">{formatMoney(costoSugerido.unitario)}</b>
              </span>
              <span className="text-gray-400">
                P. Reducido (5% desc): <b className="text-amber-400 font-mono">{formatMoney(costoSugerido.reducido)}</b>
              </span>
            </div>
            <div className="flex gap-2">
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setFormTarifa(emptyTarifa());
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={tarifaMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-lime-400 hover:bg-lime-300 text-emerald-950 transition disabled:opacity-50"
              >
                {tarifaMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : editandoId ? (
                  <Save className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {editandoId ? 'Guardar Cambios' : 'Agregar Tarifa'}
              </button>
            </div>
          </div>
          {mensajeExito && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {mensajeExito}
            </p>
          )}
          {mensajeError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {mensajeError}
            </p>
          )}
        </form>

        {cargandoTarifas ? (
          <div className="flex justify-center items-center py-8 text-emerald-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Cargando matriz de tarifas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181d29] text-gray-400 text-xs">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Km</th>
                  <th className="p-3">Flete</th>
                  <th className="p-3">Costo/Km</th>
                  <th className="p-3">Capacidad</th>
                  <th className="p-3">Unitario</th>
                  <th className="p-3">Reducido</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tarifas?.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{t.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {t.municipio}
                      </div>
                      <div className="text-[10px] text-gray-500">{t.estado}</div>
                    </td>
                    <td className="p-3 text-gray-300">{t.empresa || '—'}</td>
                    <td className="p-3 font-mono">{t.kilometros}</td>
                    <td className="p-3 font-mono">{formatMoney(t.precio_flete)}</td>
                    <td className="p-3 font-mono text-lime-400">{formatMoney(t.costo_km)}</td>
                    <td className="p-3 font-mono">
                      {t.capacidad_tarimas}
                      <span className="text-[10px] text-gray-500"> tarimas</span>
                    </td>
                    <td className="p-3 font-mono">{formatMoney(t.precio_unitario)}</td>
                    <td className="p-3 font-mono text-amber-400">{formatMoney(t.precio_reducido)}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => editarTarifa(t)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-700/40 border border-gray-600/50 text-gray-300 text-xs font-bold hover:bg-gray-600/60 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la tarifa ${t.municipio} (${t.estado})?`)) {
                              eliminarMutation.mutate(t.id);
                            }
                          }}
                          disabled={eliminarMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600/20 border border-red-600/50 text-red-400 text-xs font-bold hover:bg-red-600/40 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tarifas?.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-gray-500 text-xs">
                      No hay tarifas registradas. Agrega la primera con el formulario superior.
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