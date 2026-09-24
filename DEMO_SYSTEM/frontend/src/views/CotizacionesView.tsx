import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarCotizaciones, crearCotizacion, actualizarEstadoCotizacion } from '../api/cotizaciones';
import type { CotizacionCreate, EstadoCotizacion, Cotizacion } from '../types';
import { Calculator, Loader2, Plus, FileText, Truck, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

const IVA_RATE = 0.16;
const TIPOS_MADERA = ['Pino de primera', 'Pino estufada HT', 'Encino', 'Triplay + Pino reforzado'];
const ESTADOS: EstadoCotizacion[] = ['Borrador', 'Aprobada', 'Rechazada'];

const initialState: CotizacionCreate = {
  cliente: '',
  items: [],
  dimensiones: `40" x 48"`,
  tipo_madera: TIPOS_MADERA[0],
  precio_unitario: 380,
  cantidad: 1,
  costo_mano_obra: 0,
  flete: 0,
};

const formatMoney = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const estadoStyles: Record<EstadoCotizacion, string> = {
  Borrador: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  Aprobada: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  Rechazada: 'bg-red-950/60 text-red-400 border-red-800/50',
};

export const CotizacionesView: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CotizacionCreate>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string>('');

  const { data: cotizaciones, isLoading } = useQuery({
    queryKey: ['cotizaciones'],
    queryFn: listarCotizaciones,
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoCotizacion }) =>
      actualizarEstadoCotizacion(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cotizaciones'] }),
  });

  const subtotal =
    form.precio_unitario * form.cantidad + form.costo_mano_obra + form.flete;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const handleChange = (field: keyof CotizacionCreate, value: string | number) => {
    if (typeof value === 'string') {
      setForm((prev) => ({ ...prev, [field]: value }));
      return;
    }
    if (Number.isNaN(value)) {
      setForm((prev) => ({ ...prev, [field]: 0 }));
      return;
    }
    if (field === 'cantidad') {
      setForm((prev) => ({ ...prev, [field]: Math.max(1, Math.round(value)) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const extraerError = (err: unknown): string => {
    if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        return detail.map((d) => d.msg).join('; ');
      }
      if (typeof detail === 'string') return detail;
      if (err.response) return `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`;
    }
    return err instanceof Error ? err.message : 'Error desconocido';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    if (!form.cliente.trim()) {
      setMensajeError('El campo cliente es obligatorio.');
      return;
    }
    try {
      setIsSaving(true);
      const creada: Cotizacion = await crearCotizacion(form);
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      setForm(initialState);
      setMensajeExito(`Cotización ${creada?.folio ?? creada?.id} guardada. Total: ${formatMoney(creada?.total ?? total)}`);
    } catch (err) {
      setMensajeError(`Error al guardar la cotización: ${extraerError(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-lime-950/80 border border-lime-800/60 rounded-xl text-lime-400">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cotizaciones</h2>
            <p className="text-xs text-gray-400">
              Creación, historial y control de estados (Borrador, Aprobada, Rechazada).
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-[#181d29] p-5 rounded-xl border border-[#252c3d] space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <Plus className="w-4 h-4" /> Nueva Cotización
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-400">Cliente</label>
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => handleChange('cliente', e.target.value)}
                placeholder="Razón social o nombre del cliente"
                required
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Tipo de Madera</label>
              <select
                value={form.tipo_madera}
                onChange={(e) => handleChange('tipo_madera', e.target.value)}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
              >
                {TIPOS_MADERA.map((tipo) => (
                  <option key={tipo} value={tipo} className="bg-[#10141d]">
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400">Dimensiones</label>
              <input
                type="text"
                value={form.dimensiones}
                onChange={(e) => handleChange('dimensiones', e.target.value)}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Cantidad (Piezas)</label>
              <input
                type="number"
                min={1}
                value={form.cantidad}
                onChange={(e) => handleChange('cantidad', Number(e.target.value))}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono font-semibold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Precio Unitario ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.precio_unitario}
                onChange={(e) => handleChange('precio_unitario', Number(e.target.value))}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono font-semibold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Costo Mano de Obra ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.costo_mano_obra}
                onChange={(e) => handleChange('costo_mano_obra', Number(e.target.value))}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-400" /> Flete ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.flete}
                onChange={(e) => handleChange('flete', Number(e.target.value))}
                className="w-full mt-1 p-2.5 bg-[#10141d] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cálculo en vivo */}
          <div className="mt-4 bg-[#10141d] border border-[#252c3d] rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">SUBTOTAL ESTIMADO</span>
                <div className="text-2xl font-black text-white mt-1">{formatMoney(subtotal)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">IVA ({Math.round(IVA_RATE * 100)}%)</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{formatMoney(iva)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">TOTAL ESTIMADO</span>
                <div className="text-2xl font-black text-lime-400 mt-1">{formatMoney(total)}</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            Calcular y Guardar Cotización
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

      {/* Historial */}
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-lime-400" /> Historial de Cotizaciones
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-10 text-emerald-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando cotizaciones...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181d29] text-gray-400 text-xs">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Cant.</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">IVA</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cotizaciones?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{c.folio}</td>
                    <td className="p-3 font-bold">{c.cliente}</td>
                    <td className="p-3 text-gray-300">
                      {c.tipo_madera} <span className="text-gray-500 font-mono">{c.dimensiones}</span>
                    </td>
                    <td className="p-3 font-mono">{c.cantidad}</td>
                    <td className="p-3 font-mono">{formatMoney(c.subtotal)}</td>
                    <td className="p-3 font-mono text-amber-400">{formatMoney(c.iva)}</td>
                    <td className="p-3 font-mono font-bold text-lime-400">{formatMoney(c.total)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${estadoStyles[c.estado]}`}
                      >
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={c.estado}
                        disabled={estadoMutation.isPending}
                        onChange={(e) =>
                          estadoMutation.mutate({
                            id: c.id,
                            estado: e.target.value as EstadoCotizacion,
                          })
                        }
                        className="bg-[#181d29] border border-[#252c3d] text-xs p-1.5 rounded-lg outline-none focus:border-emerald-500"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado} className="bg-[#10141d]">
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {cotizaciones?.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500 text-xs">
                      No hay cotizaciones registradas todavía.
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