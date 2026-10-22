import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, DollarSign, CreditCard, Loader2, Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { getClientes, getEstadoCuenta, createCliente, updateCliente, deleteCliente } from '../api/modulos';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import type { EstadoCuentaCliente, ClienteCreate } from '../types';

export const ClientesView: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [editingCliente, setEditingCliente] = React.useState<ClienteCreate & { id: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<ClienteCreate & { id: number } | null>(null);
  const [selectedCliente, setSelectedCliente] = React.useState<EstadoCuentaCliente | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = React.useState<ClienteCreate>({
    razon_social: '',
    rfc: '',
    limite_credito: 0,
    credito_utilizado: 0,
    anticipos_registrados: 0,
  });

  const { data: clientes, isLoading, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const filteredClientes = clientes?.filter(c =>
    c.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rfc.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleVerEstadoCuenta = async (clienteId: number) => {
    try {
      const estado = await getEstadoCuenta(clienteId);
      setSelectedCliente(estado);
    } catch {
      setToast({ message: 'Error al cargar estado de cuenta', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setFormData({ razon_social: '', rfc: '', limite_credito: 0, credito_utilizado: 0, anticipos_registrados: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (cliente: import('../types').ClienteSchema) => {
    setEditingCliente(cliente);
    setFormData({
      razon_social: cliente.razon_social,
      rfc: cliente.rfc,
      limite_credito: cliente.limite_credito,
      credito_utilizado: cliente.credito_utilizado,
      anticipos_registrados: cliente.anticipos_registrados,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        setToast({ message: 'Cliente actualizado correctamente', type: 'success' });
      } else {
        await createCliente(formData);
        setToast({ message: 'Cliente creado correctamente', type: 'success' });
      }
      handleCloseModal();
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al guardar el cliente', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (cliente: import('../types').ClienteSchema) => {
    setDeleteConfirm(cliente);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCliente(deleteConfirm.id);
      setToast({ message: 'Cliente eliminado correctamente', type: 'success' });
      refetch();
    } catch {
      setToast({ message: 'Error al eliminar el cliente', type: 'error' });
    }
    setDeleteConfirm(null);
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading && !clientes) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando clientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Catálogo de Clientes & Cuentas por Cobrar</h2>
            <p className="text-xs text-gray-400">Líneas de crédito autorizadas, anticipos y saldos corrientes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#181d29] border border-[#252c3d] px-3 py-2 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por razón social o RFC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 text-white placeholder-gray-500"
            />
          </div>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredClientes.map((c) => (
          <div key={c.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2">
            <div className="font-bold text-white text-sm truncate">{c.razon_social}</div>
            <div className="text-[11px] text-gray-400 font-mono">RFC: {c.rfc}</div>
            <div className="border-t border-gray-800 pt-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Límite Crédito:</span>
                <span className="font-bold">${c.limite_credito.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> Utilizado:</span>
                <span className="font-bold text-amber-400">${c.credito_utilizado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Anticipos:</span>
                <span className="font-bold text-emerald-400">${c.anticipos_registrados.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Disponible:</span>
                <span className="font-bold text-emerald-400">${(c.limite_credito - c.credito_utilizado).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-2">
                <span className="text-gray-400">Saldo Pendiente:</span>
                <span className="font-bold text-red-400">${(c.credito_utilizado - c.anticipos_registrados).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleVerEstadoCuenta(c.id)}
                className="flex-1 text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 py-1.5 rounded-lg hover:bg-emerald-950/80 transition"
              >
                Ver Estado de Cuenta
              </button>
              <button onClick={() => handleOpenEdit(c)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!clientes || clientes.length === 0) && (
          <div className="md:col-span-3 bg-[#181d29] p-8 rounded-xl border border-[#252c3d] text-center text-gray-400">
            No hay clientes registrados
            <button onClick={handleOpenCreate} className="mt-4 inline-flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
              <Plus className="w-4 h-4" /> Crear primer cliente
            </button>
          </div>
        )}
      </div>

      {selectedCliente && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#10141d] border border-[#1e2430] w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Estado de Cuenta: {selectedCliente.razon_social}</h3>
              <button onClick={() => setSelectedCliente(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Límite de Crédito</div>
                <div className="font-bold text-white">${selectedCliente.limite_credito.toLocaleString()}</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Crédito Utilizado</div>
                <div className="font-bold text-amber-400">${selectedCliente.credito_utilizado.toLocaleString()}</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Crédito Disponible</div>
                <div className="font-bold text-emerald-400">${selectedCliente.credito_disponible.toLocaleString()}</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d]">
                <div className="text-gray-400">Anticipos Registrados</div>
                <div className="font-bold text-emerald-400">${selectedCliente.anticipos_registrados.toLocaleString()}</div>
              </div>
              <div className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d] col-span-2">
                <div className="text-gray-400">Saldo Pendiente</div>
                <div className="font-bold text-red-400 text-lg">${selectedCliente.saldo_pendiente.toLocaleString()}</div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">Historial de Cotizaciones</h4>
              {selectedCliente.historial_pedidos.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedCliente.historial_pedidos.map((p, idx) => (
                    <div key={idx} className="bg-[#181d29] p-3 rounded-lg border border-[#252c3d] text-xs flex justify-between">
                      <span className="font-mono text-emerald-400">{p.pedido_id}</span>
                      <span className="text-gray-300">${p.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sin historial de cotizaciones</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Cliente */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400">Razón Social *</label>
            <input type="text" value={formData.razon_social} onChange={(e) => setFormData({...formData, razon_social: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
          </div>
          <div>
            <label className="block text-xs text-gray-400">RFC *</label>
            <input type="text" value={formData.rfc} onChange={(e) => setFormData({...formData, rfc: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required placeholder="XAXX010101000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Límite de Crédito *</label>
              <input type="number" step="0.01" value={formData.limite_credito} onChange={(e) => setFormData({...formData, limite_credito: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Crédito Utilizado</label>
              <input type="number" step="0.01" value={formData.credito_utilizado} onChange={(e) => setFormData({...formData, credito_utilizado: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Anticipos Registrados</label>
            <input type="number" step="0.01" value={formData.anticipos_registrados} onChange={(e) => setFormData({...formData, anticipos_registrados: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" />
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300">{editingCliente ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message={`¿Está seguro de eliminar al cliente "${deleteConfirm?.razon_social}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};