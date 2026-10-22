import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, AlertCircle, Loader2, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { getInsumosClavado, createInsumo, updateInsumo, deleteInsumo } from '../api/modulos';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import type { InsumoCreate, InsumoClavado } from '../types';

export const InsumosClavadoView: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [editingInsumo, setEditingInsumo] = React.useState<InsumoClavado | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<InsumoClavado | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = React.useState<InsumoCreate>({
    codigo: '',
    descripcion: '',
    tipo: 'CLAVO_ESPIRAL',
    medida: '',
    existencia_kg: 0,
    stock_minimo_kg: 0,
    linea_asignada: 'Línea 1',
  });

  const { data: insumos, isLoading, refetch } = useQuery({
    queryKey: ['insumos-clavado'],
    queryFn: getInsumosClavado,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const createMutation = useMutation({
    mutationFn: createInsumo,
    onSuccess: () => {
      handleCloseModal();
      refetch();
      setToast({ message: 'Insumo creado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al crear el insumo', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsumoCreate }) => updateInsumo(id, data),
    onSuccess: () => {
      handleCloseModal();
      refetch();
      setToast({ message: 'Insumo actualizado correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al actualizar el insumo', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const getStockStatus = (existencia: number, minimo: number) => {
    if (existencia <= minimo) return { label: 'Crítico', color: 'text-red-400 bg-red-950/50 border-red-500/30', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    if (existencia <= minimo * 1.5) return { label: 'Bajo', color: 'text-amber-400 bg-amber-950/50 border-amber-500/30', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    return { label: 'Normal', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30', icon: <CheckCircle className="w-3.5 h-3.5" /> };
  };

  const handleOpenCreate = () => {
    setEditingInsumo(null);
    setFormData({ codigo: '', descripcion: '', tipo: 'CLAVO_ESPIRAL', medida: '', existencia_kg: 0, stock_minimo_kg: 0, linea_asignada: 'Línea 1' });
    setShowModal(true);
  };

  const handleOpenEdit = (insumo: InsumoClavado) => {
    setEditingInsumo(insumo);
    setFormData({
      codigo: insumo.codigo,
      descripcion: insumo.descripcion,
      tipo: insumo.tipo,
      medida: insumo.medida,
      existencia_kg: insumo.existencia_kg,
      stock_minimo_kg: insumo.stock_minimo_kg,
      linea_asignada: insumo.linea_asignada,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInsumo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInsumo) {
      updateMutation.mutate({ id: editingInsumo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (insumo: InsumoClavado) => {
    setDeleteConfirm(insumo);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteInsumo(deleteConfirm.id);
      refetch();
      setToast({ message: 'Insumo eliminado correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al eliminar el insumo', type: 'error' });
    }
    setDeleteConfirm(null);
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading && !insumos) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando insumos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Control de Insumos & Clavado</h2>
            <p className="text-xs text-gray-400">Stock en tiempo real de clavos en rollo, grapas y pintura de marcado por línea.</p>
          </div>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Nuevo Insumo
        </button>
      </div>

      {insumos && insumos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insumos.map((insumo) => {
            const status = getStockStatus(insumo.existencia_kg, insumo.stock_minimo_kg);
            return (
              <div key={insumo.id} className="bg-[#181d29] p-5 rounded-xl border border-[#252c3d] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm">{insumo.descripcion}</span>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">Cód: {insumo.codigo}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEdit(insumo)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(insumo)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#10141d] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400">Existencia</div>
                    <div className="text-lg font-black text-white mt-1">{insumo.existencia_kg.toLocaleString()} kg</div>
                  </div>
                  <div className="bg-[#10141d] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400">Stock Mínimo</div>
                    <div className="text-lg font-black text-amber-400 mt-1">{insumo.stock_minimo_kg.toLocaleString()} kg</div>
                  </div>
                  <div className="bg-[#10141d] p-3 rounded-lg border border-gray-800 col-span-2">
                    <div className="text-gray-400">Tipo / Medida</div>
                    <div className="text-sm font-bold text-white mt-1">{insumo.tipo} / {insumo.medida}</div>
                  </div>
                  <div className="bg-[#10141d] p-3 rounded-lg border border-gray-800 col-span-2">
                    <div className="text-gray-400">Línea Asignada</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{insumo.linea_asignada}</div>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded font-mono border ${status.color} flex items-center justify-center gap-1`}>
                  {status.icon} {status.label}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#181d29] p-8 rounded-xl border border-[#252c3d] text-center text-gray-400">
          No hay insumos registrados
          <button onClick={handleOpenCreate} className="mt-4 inline-flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Plus className="w-4 h-4" /> Crear primer insumo
          </button>
        </div>
      )}

      {/* Modal Crear/Editar Insumo */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Código *</label>
              <input type="text" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Tipo *</label>
              <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as InsumoCreate['tipo']})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                <option value="CLAVO_ESPIRAL">Clavo Espiral</option>
                <option value="GRAPA">Grapa</option>
                <option value="ESQUINERO">Esquinero</option>
                <option value="PINTURA">Pintura</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Descripción *</label>
            <input type="text" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required placeholder='Ej: Clavo Espiral en Rollo 2 1/2"' />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Medida *</label>
              <input type="text" value={formData.medida} onChange={(e) => setFormData({...formData, medida: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required placeholder='Ej: 2 1/2"' />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Línea Asignada *</label>
              <select value={formData.linea_asignada} onChange={(e) => setFormData({...formData, linea_asignada: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                <option value="Línea 1">Línea 1</option>
                <option value="Línea 2">Línea 2</option>
                <option value="Línea 3">Línea 3</option>
                <option value="Línea 4">Línea 4</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Existencia (kg) *</label>
              <input type="number" step="0.01" value={formData.existencia_kg} onChange={(e) => setFormData({...formData, existencia_kg: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Stock Mínimo (kg) *</label>
              <input type="number" step="0.01" value={formData.stock_minimo_kg} onChange={(e) => setFormData({...formData, stock_minimo_kg: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : editingInsumo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Eliminar Insumo"
        message={`¿Está seguro de eliminar el insumo "${deleteConfirm?.descripcion}" (${deleteConfirm?.codigo})?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};