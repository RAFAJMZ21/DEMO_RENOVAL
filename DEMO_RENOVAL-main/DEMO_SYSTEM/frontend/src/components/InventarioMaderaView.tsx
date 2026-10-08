import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Boxes, Plus, AlertCircle, Loader2, CheckCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { getInventarioAlmacen, getInsumosClavado, createEntradaMadera, getEntradasMadera } from '../api/modulos';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import type { EntradaMaderaCreate, EntradaMaderaResponse } from '../api/modulos';
import api from '../api/axios';

export const InventarioMaderaView: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<EntradaMaderaResponse | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'stock' | 'entradas'>('stock');

  const [formData, setFormData] = React.useState<EntradaMaderaCreate>({
    tipo: 'VERDE',
    metros_cubicos: 0,
    proveedor: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const { data: inventario, isLoading, isFetching, refetch: refetchInventario } = useQuery({
    queryKey: ['inventario-madera'],
    queryFn: getInventarioAlmacen,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: insumos } = useQuery({
    queryKey: ['insumos-clavado'],
    queryFn: getInsumosClavado,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: entradas, refetch: refetchEntradas } = useQuery({
    queryKey: ['entradas-madera'],
    queryFn: getEntradasMadera,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createEntradaMadera,
    onSuccess: () => {
      setShowModal(false);
      setFormData({ tipo: 'VERDE', metros_cubicos: 0, proveedor: '', fecha: new Date().toISOString().split('T')[0], observaciones: '' });
      refetchInventario();
      refetchEntradas();
      setToast({ message: 'Entrada de madera registrada correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al registrar la entrada', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const handleDelete = (entrada: EntradaMaderaResponse) => {
    setDeleteConfirm(entrada);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`v1/almacen/entradas-madera/${deleteConfirm.id}`);
      refetchInventario();
      refetchEntradas();
      setToast({ message: 'Entrada eliminada correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al eliminar la entrada', type: 'error' });
    }
    setDeleteConfirm(null);
    setTimeout(() => setToast(null), 3000);
  };

  const getStockStatus = (existencia: number, minimo: number) => {
    if (existencia <= minimo) return { label: 'Bajo Stock', color: 'text-amber-400 bg-amber-950 border-amber-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    if (existencia <= minimo * 1.5) return { label: 'Punto Reorden', color: 'text-yellow-400 bg-yellow-950 border-yellow-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    return { label: 'OK', color: 'text-emerald-400 bg-emerald-950 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> };
  };

  if (isLoading && !inventario) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando inventario en tiempo real...</span>
      </div>
    );
  }

  const maderaVerde = inventario?.insumos.find(i => i.item.includes('Madera Pino Verde')) || { existencia: '450 m³' };
  const maderaEstufada = inventario?.insumos.find(i => i.item.includes('Madera Pino Estufada')) || { existencia: '125 m³' };

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" /> Inventario & Cubaje de Madera (Pies Tablares)
          </h2>
          <p className="text-xs text-gray-400">Control de trozas y tablas de pino. Fórmula: (Ancho x Grueso x Largo) / 144.</p>
        </div>
        <button onClick={() => { setFormData({ tipo: 'VERDE', metros_cubicos: 0, proveedor: '', fecha: new Date().toISOString().split('T')[0], observaciones: '' }); setShowModal(true); }} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Registrar Entrada Madera
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#10141d] p-2 rounded-xl border border-[#1e2430] flex gap-1 w-fit">
        <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'stock' ? 'bg-emerald-950/80 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
          Stock Actual
        </button>
        <button onClick={() => setActiveTab('entradas')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'entradas' ? 'bg-emerald-950/80 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
          Historial Entradas
        </button>
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
              <span className="text-xs text-gray-400">STOCK MADERA VERDE</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{maderaVerde.existencia}</div>
              <span className="text-[10px] text-gray-400">~190,800 Pies Tablares</span>
            </div>
            <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
              <span className="text-xs text-gray-400">ESTUFADA LISTA (HT)</span>
              <div className="text-2xl font-black text-lime-400 mt-1">{maderaEstufada.existencia}</div>
              <span className="text-[10px] text-gray-400">Listas para armado</span>
            </div>
            <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
              <span className="text-xs text-gray-400">INSUMOS CLAVADO</span>
              <div className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{insumos?.length ?? 0} items</span>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
              </div>
              <span className="text-[10px] text-gray-400">Ver detalle en Insumos & Clavado</span>
            </div>
          </div>

          {insumos && insumos.length > 0 && (
            <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" /> Insumos de Clavado - Stock en Tiempo Real
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insumos.map((insumo) => {
                  const status = getStockStatus(insumo.existencia_kg, insumo.stock_minimo_kg);
                  return (
                    <div key={insumo.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{insumo.descripcion}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-mono border ${status.color} flex items-center gap-1`}>
                          {status.icon}
                          <span className="ml-1">{status.label}</span>
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white">{insumo.existencia_kg.toLocaleString()} kg</div>
                      <div className="text-xs text-gray-400">Mín: {insumo.stock_minimo_kg.toLocaleString()} kg • {insumo.linea_asignada}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'entradas' && (
        <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Historial de Entradas de Madera
          </h3>
          {entradas && entradas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#181d29] text-gray-400 text-xs">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Metros Cúbicos</th>
                    <th className="p-3">Proveedor</th>
                    <th className="p-3">Observaciones</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {entradas.map((entrada) => (
                    <tr key={entrada.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{entrada.fecha}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${entrada.tipo === 'VERDE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {entrada.tipo}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-white">{entrada.metros_cubicos} m³</td>
                      <td className="p-3 text-gray-300">{entrada.proveedor}</td>
                      <td className="p-3 text-gray-400 text-xs">{entrada.observaciones || '-'}</td>
                      <td className="p-3">
                        <button onClick={() => handleDelete(entrada)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">No hay entradas registradas</div>
          )}
        </div>
      )}

      {/* Modal Registrar Entrada */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Entrada de Madera" size="md">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400">Tipo de Madera *</label>
            <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as 'VERDE' | 'ESTUFADA'})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
              <option value="VERDE">Madera Verde (Troza/Tabla)</option>
              <option value="ESTUFADA">Madera Estufada (HT)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Metros Cúbicos *</label>
              <input type="number" step="0.01" value={formData.metros_cubicos} onChange={(e) => setFormData({...formData, metros_cubicos: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Fecha *</label>
              <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Proveedor *</label>
            <input type="text" value={formData.proveedor} onChange={(e) => setFormData({...formData, proveedor: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required placeholder="Ej: Aserraderos del Valle" />
          </div>
          <div>
            <label className="block text-xs text-gray-400">Observaciones</label>
            <textarea value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} rows={3} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" placeholder="Detalles adicionales..." />
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300 disabled:opacity-50">
              {createMutation.isPending ? 'Registrando...' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Eliminar Entrada"
        message={`¿Está seguro de eliminar la entrada de ${deleteConfirm?.metros_cubicos} m³ de ${deleteConfirm?.tipo} de ${deleteConfirm?.proveedor}?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}