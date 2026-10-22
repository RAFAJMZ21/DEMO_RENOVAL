import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Plus, Loader2, ShieldCheck, UserCog, Mail, Edit, Trash2, Eye } from 'lucide-react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getRoles } from '../api/modulos';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import type { UserRegisterPayload, Usuario } from '../types';
import api from '../api/axios';

interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  rol: string;
  created_at: string;
}

const rolColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  OPERADOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ALMACENISTA: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CLIENTE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROVEEDOR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const rolIcons: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="w-3.5 h-3.5" />,
  OPERADOR: <UserCog className="w-3.5 h-3.5" />,
  ALMACENISTA: <UserCog className="w-3.5 h-3.5" />,
  CLIENTE: <Mail className="w-3.5 h-3.5" />,
  PROVEEDOR: <UserCheck className="w-3.5 h-3.5" />,
};

export const GestionUsuariosView: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UsuarioResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<UsuarioResponse | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [roles, setRoles] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState<UserRegisterPayload>({
    username: '',
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'OPERADOR',
  });

  const { data: usuarios, isLoading, refetch } = useQuery<UsuarioResponse[]>({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  React.useEffect(() => {
    getRoles().then(setRoles);
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', nombre_completo: '', rol: 'OPERADOR' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: UsuarioResponse) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      nombre_completo: user.nombre_completo,
      rol: user.rol as UserRegisterPayload['rol'],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await updateUsuario(editingUser.id, password ? { ...updateData, password } : updateData);
        setToast({ message: 'Usuario actualizado correctamente', type: 'success' });
      } else {
        await createUsuario(formData);
        setToast({ message: 'Usuario creado correctamente', type: 'success' });
      }
      handleCloseModal();
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al guardar el usuario', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (user: UsuarioResponse) => {
    setDeleteConfirm(user);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteUsuario(deleteConfirm.id);
      setToast({ message: 'Usuario eliminado correctamente', type: 'success' });
      refetch();
    } catch {
      setToast({ message: 'Error al eliminar el usuario', type: 'error' });
    }
    setDeleteConfirm(null);
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading && !usuarios) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" /> Gestión de Personal & Permisos
          </h2>
          <p className="text-xs text-gray-400">Control de roles (Administrador, Operador, Almacenista, Cliente, Proveedor).</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {usuarios && usuarios.length > 0 ? (
        <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Email</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Registrado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{u.username}</td>
                  <td className="p-3 text-gray-300">{u.email}</td>
                  <td className="p-3 font-medium text-white">{u.nombre_completo}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${rolColors[u.rol] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {rolIcons[u.rol]}
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-400 font-mono">{u.created_at?.split('T')[0] || '-'}</td>
                  <td className="p-3 flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(u)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#181d29] p-8 rounded-xl border border-[#252c3d] text-center text-gray-400">
          No hay usuarios registrados
          <button onClick={handleOpenCreate} className="mt-4 inline-flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Plus className="w-4 h-4" /> Crear primer usuario
          </button>
        </div>
      )}

      {/* Modal Crear/Editar Usuario */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Usuario *</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required disabled={!!editingUser} />
              {editingUser && <p className="text-[10px] text-gray-500 mt-1">El nombre de usuario no se puede cambiar</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">{editingUser ? 'Nueva Contraseña' : 'Contraseña *'} </label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required={!editingUser} placeholder={editingUser ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Nombre Completo *</label>
              <input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Rol *</label>
            <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value as UserRegisterPayload['rol']})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
              {roles.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300">{editingUser ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Está seguro de eliminar al usuario "${deleteConfirm?.username}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};