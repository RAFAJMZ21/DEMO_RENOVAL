import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, CheckCircle2, Loader2, MapPin, Calendar, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { getEmbarquesDespacho, getFletesDestino, createEmbarque, updateEmbarque, deleteEmbarque, createFlete, updateFlete, deleteFlete } from '../api/modulos';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import type { EmbarqueCreate, FleteTarifa } from '../api/modulos';

interface EmbarqueData {
  id: number;
  folio_embarque: string;
  cliente: string;
  chofer: string;
  placas_trailer: string;
  tarimas_cargadas: number;
  fecha_despacho: string;
  estatus: string;
}

interface FleteData {
  id?: number;
  estado: string;
  municipio: string;
  km: number;
  precio_flete: number;
  capacidad: number;
  costo_tarima_unitario: number;
  activo?: boolean;
}

export const LogisticaDespachoView: React.FC = () => {
  const queryClient = useQueryClient();
  const [showEmbarqueModal, setShowEmbarqueModal] = React.useState(false);
  const [editingEmbarque, setEditingEmbarque] = React.useState<EmbarqueData | null>(null);
  const [deleteEmbarqueConfirm, setDeleteEmbarqueConfirm] = React.useState<EmbarqueData | null>(null);
  const [showFleteModal, setShowFleteModal] = React.useState(false);
  const [editingFlete, setEditingFlete] = React.useState<FleteData | null>(null);
  const [deleteFleteConfirm, setDeleteFleteConfirm] = React.useState<FleteData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [embarqueFormData, setEmbarqueFormData] = React.useState<EmbarqueCreate>({
    folio_embarque: '',
    cliente: '',
    chofer: '',
    placas_trailer: '',
    tarimas_cargadas: 0,
    fecha_despacho: new Date().toISOString().split('T')[0],
    estatus: 'PROGRAMADO',
  });

  const [fleteFormData, setFleteFormData] = React.useState<FleteTarifa>({
    estado: '',
    municipio: '',
    km: 0,
    precio_flete: 0,
    capacidad: 0,
    costo_tarima_unitario: 0,
    activo: true,
  });

  const { data: embarques, isLoading: loadingEmbarques, isFetching: fetchingEmbarques, refetch: refetchEmbarques } = useQuery({
    queryKey: ['embarques-despacho'],
    queryFn: getEmbarquesDespacho,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: fletes, refetch: refetchFletes } = useQuery({
    queryKey: ['fletes-destino'],
    queryFn: getFletesDestino,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const createEmbarqueMutation = useMutation({
    mutationFn: createEmbarque,
    onSuccess: () => {
      handleCloseEmbarqueModal();
      refetchEmbarques();
      setToast({ message: 'Embarque creado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al crear el embarque', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateEmbarqueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmbarqueCreate }) => updateEmbarque(id, data),
    onSuccess: () => {
      handleCloseEmbarqueModal();
      refetchEmbarques();
      setToast({ message: 'Embarque actualizado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al actualizar el embarque', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const createFleteMutation = useMutation({
    mutationFn: createFlete,
    onSuccess: () => {
      handleCloseFleteModal();
      refetchFletes();
      setToast({ message: 'Flete creado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al crear el flete', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateFleteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FleteTarifa }) => updateFlete(id, data),
    onSuccess: () => {
      handleCloseFleteModal();
      refetchFletes();
      setToast({ message: 'Flete actualizado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al actualizar el flete', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const deleteEmbarqueMutation = useMutation({
    mutationFn: deleteEmbarque,
    onSuccess: () => {
      refetchEmbarques();
      setToast({ message: 'Embarque eliminado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Error al eliminar el embarque', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const deleteFleteMutation = useMutation({
    mutationFn: deleteFlete,
    onSuccess: () => {
      refetchFletes();
      setToast({ message: 'Flete eliminado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Error al eliminar el flete', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
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

  const handleOpenCreateEmbarque = () => {
    setEditingEmbarque(null);
    setEmbarqueFormData({
      folio_embarque: '',
      cliente: '',
      chofer: '',
      placas_trailer: '',
      tarimas_cargadas: 0,
      fecha_despacho: new Date().toISOString().split('T')[0],
      estatus: 'PROGRAMADO',
    });
    setShowEmbarqueModal(true);
  };

  const handleOpenEditEmbarque = (embarque: EmbarqueData) => {
    setEditingEmbarque(embarque);
    setEmbarqueFormData({
      folio_embarque: embarque.folio_embarque,
      cliente: embarque.cliente,
      chofer: embarque.chofer,
      placas_trailer: embarque.placas_trailer,
      tarimas_cargadas: embarque.tarimas_cargadas,
      fecha_despacho: embarque.fecha_despacho,
      estatus: embarque.estatus,
    });
    setShowEmbarqueModal(true);
  };

  const handleCloseEmbarqueModal = () => {
    setShowEmbarqueModal(false);
    setEditingEmbarque(null);
  };

  const handleEmbarqueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmbarque) {
      updateEmbarqueMutation.mutate({ id: editingEmbarque.id, data: embarqueFormData });
    } else {
      createEmbarqueMutation.mutate(embarqueFormData);
    }
  };

  const handleDeleteEmbarque = (embarque: EmbarqueData) => {
    setDeleteEmbarqueConfirm(embarque);
  };

  const confirmDeleteEmbarque = () => {
    if (!deleteEmbarqueConfirm) return;
    deleteEmbarqueMutation.mutate(deleteEmbarqueConfirm.id);
    setDeleteEmbarqueConfirm(null);
  };

  const handleOpenCreateFlete = () => {
    setEditingFlete(null);
    setFleteFormData({
      estado: '',
      municipio: '',
      km: 0,
      precio_flete: 0,
      capacidad: 0,
      costo_tarima_unitario: 0,
      activo: true,
    });
    setShowFleteModal(true);
  };

  const handleOpenEditFlete = (flete: FleteData) => {
    setEditingFlete(flete);
    setFleteFormData({
      estado: flete.estado,
      municipio: flete.municipio,
      km: flete.km,
      precio_flete: flete.precio_flete,
      capacidad: flete.capacidad,
      costo_tarima_unitario: flete.costo_tarima_unitario,
      activo: flete.activo,
    });
    setShowFleteModal(true);
  };

  const handleCloseFleteModal = () => {
    setShowFleteModal(false);
    setEditingFlete(null);
  };

  const handleFleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFlete && editingFlete.id) {
      updateFleteMutation.mutate({ id: editingFlete.id, data: fleteFormData });
    } else {
      createFleteMutation.mutate(fleteFormData);
    }
  };

  const handleDeleteFlete = (flete: FleteData) => {
    setDeleteFleteConfirm(flete);
  };

  const confirmDeleteFlete = () => {
    if (!deleteFleteConfirm || !deleteFleteConfirm.id) return;
    deleteFleteMutation.mutate(deleteFleteConfirm.id);
    setDeleteFleteConfirm(null);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
          <button onClick={handleOpenCreateEmbarque} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Plus className="w-4 h-4" /> Nuevo Embarque
          </button>
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
              <th className="p-3">Acciones</th>
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
                <td className="p-3 flex items-center gap-2">
                  <button onClick={() => handleOpenEditEmbarque(emb)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteEmbarque(emb)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!embarques || embarques.length === 0) && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">No hay embarques registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {fletes && fletes.length > 0 && (
        <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" /> Matriz de Fletes - Costos por Destino
            </h3>
            <button onClick={handleOpenCreateFlete} className="flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs hover:bg-amber-500/30 transition">
              <Plus className="w-3.5 h-3.5" /> Nuevo Flete
            </button>
          </div>
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
                  <th className="p-3">Activo</th>
                  <th className="p-3">Acciones</th>
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
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {f.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <button onClick={() => handleOpenEditFlete(f)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteFlete(f)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Embarque */}
      <Modal isOpen={showEmbarqueModal} onClose={handleCloseEmbarqueModal} title={editingEmbarque ? 'Editar Embarque' : 'Nuevo Embarque'} size="md">
        <form onSubmit={handleEmbarqueSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Folio Embarque *</label>
              <input type="text" value={embarqueFormData.folio_embarque} onChange={(e) => setEmbarqueFormData({...embarqueFormData, folio_embarque: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required disabled={!!editingEmbarque} />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Cliente *</label>
              <input type="text" value={embarqueFormData.cliente} onChange={(e) => setEmbarqueFormData({...embarqueFormData, cliente: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Chofer *</label>
              <input type="text" value={embarqueFormData.chofer} onChange={(e) => setEmbarqueFormData({...embarqueFormData, chofer: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Placas Trailer *</label>
              <input type="text" value={embarqueFormData.placas_trailer} onChange={(e) => setEmbarqueFormData({...embarqueFormData, placas_trailer: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Tarimas Cargadas *</label>
              <input type="number" value={embarqueFormData.tarimas_cargadas} onChange={(e) => setEmbarqueFormData({...embarqueFormData, tarimas_cargadas: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Fecha Despacho *</label>
              <input type="date" value={embarqueFormData.fecha_despacho} onChange={(e) => setEmbarqueFormData({...embarqueFormData, fecha_despacho: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Estatus *</label>
            <select value={embarqueFormData.estatus} onChange={(e) => setEmbarqueFormData({...embarqueFormData, estatus: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
              <option value="PROGRAMADO">PROGRAMADO</option>
              <option value="EN_TRANSITO">EN_TRANSITO</option>
              <option value="ENTREGADO">ENTREGADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseEmbarqueModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={createEmbarqueMutation.isPending || updateEmbarqueMutation.isPending} className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300 disabled:opacity-50">
              {createEmbarqueMutation.isPending || updateEmbarqueMutation.isPending ? 'Guardando...' : editingEmbarque ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar Embarque */}
      <ConfirmModal
        isOpen={!!deleteEmbarqueConfirm}
        onClose={() => setDeleteEmbarqueConfirm(null)}
        onConfirm={confirmDeleteEmbarque}
        title="Eliminar Embarque"
        message={`¿Está seguro de eliminar el embarque "${deleteEmbarqueConfirm?.folio_embarque}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal Crear/Editar Flete */}
      <Modal isOpen={showFleteModal} onClose={handleCloseFleteModal} title={editingFlete ? 'Editar Flete' : 'Nuevo Flete'} size="md">
        <form onSubmit={handleFleteSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Estado *</label>
              <input type="text" value={fleteFormData.estado} onChange={(e) => setFleteFormData({...fleteFormData, estado: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Municipio *</label>
              <input type="text" value={fleteFormData.municipio} onChange={(e) => setFleteFormData({...fleteFormData, municipio: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Distancia (km) *</label>
              <input type="number" value={fleteFormData.km} onChange={(e) => setFleteFormData({...fleteFormData, km: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Precio Flete *</label>
              <input type="number" step="0.01" value={fleteFormData.precio_flete} onChange={(e) => setFleteFormData({...fleteFormData, precio_flete: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Capacidad (pzs) *</label>
              <input type="number" value={fleteFormData.capacidad} onChange={(e) => setFleteFormData({...fleteFormData, capacidad: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Costo Unitario / Tarima *</label>
              <input type="number" step="0.01" value={fleteFormData.costo_tarima_unitario} onChange={(e) => setFleteFormData({...fleteFormData, costo_tarima_unitario: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Activo</label>
            <select value={fleteFormData.activo ? 'true' : 'false'} onChange={(e) => setFleteFormData({...fleteFormData, activo: e.target.value === 'true'})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseFleteModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={createFleteMutation.isPending || updateFleteMutation.isPending} className="flex-1 bg-amber-500 text-amber-950 py-2.5 rounded-xl font-black hover:bg-amber-400 disabled:opacity-50">
              {createFleteMutation.isPending || updateFleteMutation.isPending ? 'Guardando...' : editingFlete ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar Flete */}
      <ConfirmModal
        isOpen={!!deleteFleteConfirm}
        onClose={() => setDeleteFleteConfirm(null)}
        onConfirm={confirmDeleteFlete}
        title="Eliminar Flete"
        message={`¿Está seguro de eliminar el flete ${deleteFleteConfirm?.estado} - ${deleteFleteConfirm?.municipio}?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};