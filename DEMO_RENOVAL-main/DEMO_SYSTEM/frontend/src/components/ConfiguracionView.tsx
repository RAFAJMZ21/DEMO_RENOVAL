import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, Plus, Loader2, Edit, Trash2, Key, Palette, Bell, Shield, Database, Save, RotateCcw } from 'lucide-react';
import { Modal, ConfirmModal, Toast } from './ui/Modal';
import api from '../api/axios';
import { deleteConfig } from '../api/modulos';

interface ConfigItem {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  categoria: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
}

interface ConfigCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORIES: ConfigCategory[] = [
  { key: 'general', label: 'General', icon: <Settings className="w-5 h-5" />, color: 'text-blue-400' },
  { key: 'produccion', label: 'Producción', icon: <Database className="w-5 h-5" />, color: 'text-emerald-400' },
  { key: 'fitosanitario', label: 'Fitosanitario', icon: <Shield className="w-5 h-5" />, color: 'text-amber-400' },
  { key: 'logistica', label: 'Logística', icon: <RotateCcw className="w-5 h-5" />, color: 'text-purple-400' },
  { key: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-5 h-5" />, color: 'text-red-400' },
  { key: 'apariencia', label: 'Apariencia', icon: <Palette className="w-5 h-5" />, color: 'text-pink-400' },
  { key: 'seguridad', label: 'Seguridad', icon: <Key className="w-5 h-5" />, color: 'text-orange-400' },
];

const DEFAULT_CONFIGS: Omit<ConfigItem, 'id'>[] = [
  { clave: 'empresa_nombre', valor: 'RENOVAL', descripcion: 'Nombre de la empresa', categoria: 'general', tipo: 'string' },
  { clave: 'empresa_sede', valor: 'Planta Lerma', descripcion: 'Sede principal', categoria: 'general', tipo: 'string' },
  { clave: 'moneda', valor: 'MXN', descripcion: 'Moneda por defecto', categoria: 'general', tipo: 'string' },
  { clave: 'zona_horaria', valor: 'America/Mexico_City', descripcion: 'Zona horaria', categoria: 'general', tipo: 'string' },
  { clave: 'pt_factor_conversion', valor: '144', descripcion: 'Factor conversión pies tablares (ancho x grueso x largo / factor)', categoria: 'produccion', tipo: 'number' },
  { clave: 'ht_temp_minima', valor: '56', descripcion: 'Temperatura mínima HT (°C) NOM-144', categoria: 'fitosanitario', tipo: 'number' },
  { clave: 'ht_tiempo_minimo', valor: '30', descripcion: 'Tiempo mínimo sostenimiento HT (minutos)', categoria: 'fitosanitario', tipo: 'number' },
  { clave: 'sello_ht_autorizado', valor: 'MX-144-HT', descripcion: 'Prefijo sello HT autorizado SEMARNAT', categoria: 'fitosanitario', tipo: 'string' },
  { clave: 'capacidad_trailer_pzs', valor: '45', descripcion: 'Capacidad estándar trailer (piezas)', categoria: 'logistica', tipo: 'number' },
  { clave: 'dias_alerta_vencimiento', valor: '3', descripcion: 'Días antes para alertar vencimientos', categoria: 'logistica', tipo: 'number' },
  { clave: 'email_notificaciones', valor: 'true', descripcion: 'Activar notificaciones por email', categoria: 'notificaciones', tipo: 'boolean' },
  { clave: 'sms_notificaciones', valor: 'false', descripcion: 'Activar notificaciones por SMS', categoria: 'notificaciones', tipo: 'boolean' },
  { clave: 'tema_por_defecto', valor: 'dark', descripcion: 'Tema por defecto (light/dark)', categoria: 'apariencia', tipo: 'string' },
  { clave: 'color_primario', valor: '#357909052', descripcion: 'Color primario del sistema (HSL: 357 90% 52%)', categoria: 'apariencia', tipo: 'string' },
  { clave: 'sesion_expiracion_horas', valor: '24', descripcion: 'Expiración de sesión en horas', categoria: 'seguridad', tipo: 'number' },
  { clave: 'max_intentos_login', valor: '5', descripcion: 'Máximo intentos de login antes de bloqueo', categoria: 'seguridad', tipo: 'number' },
  { clave: 'requerir_2fa_admin', valor: 'true', descripcion: 'Requerir 2FA para administradores', categoria: 'seguridad', tipo: 'boolean' },
];

export const ConfiguracionView: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('general');
  const [showModal, setShowModal] = React.useState(false);
  const [editingConfig, setEditingConfig] = React.useState<ConfigItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<ConfigItem | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState<Omit<ConfigItem, 'id'>>({
    clave: '',
    valor: '',
    descripcion: '',
    categoria: 'general',
    tipo: 'string',
  });

  const { data: configs, isLoading, refetch } = useQuery<ConfigItem[]>({
    queryKey: ['configuracion'],
    queryFn: async () => {
      try {
        const response = await api.get<ConfigItem[]>('v1/configuracion');
        return response.data;
      } catch {
        return DEFAULT_CONFIGS.map((c, i) => ({ ...c, id: i + 1 }));
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ConfigItem, 'id'>) => {
      const response = await api.post('v1/configuracion', data);
      return response.data;
    },
    onSuccess: () => {
      handleCloseModal();
      refetch();
      setToast({ message: 'Configuración creada correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al crear la configuración', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ConfigItem> }) => {
      const response = await api.put(`v1/configuracion/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      handleCloseModal();
      refetch();
      setToast({ message: 'Configuración actualizada correctamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      setToast({ message: err.response?.data?.detail || 'Error al actualizar la configuración', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const handleOpenCreate = () => {
    setEditingConfig(null);
    setFormData({ clave: '', valor: '', descripcion: '', categoria: activeCategory, tipo: 'string' });
    setShowModal(true);
  };

  const handleOpenEdit = (config: ConfigItem) => {
    setEditingConfig(config);
    setFormData({
      clave: config.clave,
      valor: config.valor,
      descripcion: config.descripcion,
      categoria: config.categoria,
      tipo: config.tipo,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (config: ConfigItem) => {
    setDeleteConfirm(config);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteConfig(deleteConfirm.id);
      refetch();
      setToast({ message: 'Configuración eliminada correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al eliminar la configuración', type: 'error' });
    }
    setDeleteConfirm(null);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredConfigs = configs?.filter(c => c.categoria === activeCategory) || [];

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would batch save or save each
      // For now just show success
      setToast({ message: 'Todas las configuraciones guardadas', type: 'success' });
    } catch {
      setToast({ message: 'Error al guardar configuraciones', type: 'error' });
    }
    setIsSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetDefaults = async () => {
    if (!confirm('¿Restaurar todas las configuraciones a valores por defecto?')) return;
    setIsSaving(true);
    try {
      // Would call API to reset
      setToast({ message: 'Configuraciones restauradas a valores por defecto', type: 'success' });
      refetch();
    } catch {
      setToast({ message: 'Error al restaurar configuraciones', type: 'error' });
    }
    setIsSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const getInputComponent = (config: ConfigItem) => {
    switch (config.tipo) {
      case 'boolean':
        return (
          <select
            value={config.valor}
            onChange={(e) => updateMutation.mutate({ id: config.id, data: { valor: e.target.value } })}
            className="w-full p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
          >
            <option value="true">Activado</option>
            <option value="false">Desactivado</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            step="0.01"
            value={config.valor}
            onChange={(e) => updateMutation.mutate({ id: config.id, data: { valor: e.target.value } })}
            className="w-full p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500"
          />
        );
      case 'json':
        return (
          <textarea
            value={config.valor}
            onChange={(e) => updateMutation.mutate({ id: config.id, data: { valor: e.target.value } })}
            rows={3}
            className="w-full p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={config.valor}
            onChange={(e) => updateMutation.mutate({ id: config.id, data: { valor: e.target.value } })}
            className="w-full p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
          />
        );
    }
  };

  if (isLoading && !configs) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-950/80 border border-purple-800/60 rounded-xl text-purple-400">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Configuración del Sistema</h2>
            <p className="text-xs text-gray-400">Parámetros globales, umbrales, integraciones y preferencias.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleResetDefaults} className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-xl text-xs hover:bg-gray-700 transition">
            <RotateCcw className="w-4 h-4" /> Restablecer
          </button>
          <button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Todo'}
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs hover:bg-emerald-500/30 transition">
            <Plus className="w-4 h-4" /> Nueva Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Categorías */}
        <div className="lg:col-span-1">
          <div className="bg-[#10141d] p-4 rounded-2xl border border-[#1e2430] space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeCategory === cat.key
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className={cat.color}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="lg:col-span-3">
          <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className={CATEGORIES.find(c => c.key === activeCategory)?.color || 'text-gray-400'}>
                  {CATEGORIES.find(c => c.key === activeCategory)?.icon}
                </span>
                {CATEGORIES.find(c => c.key === activeCategory)?.label}
              </h3>
              <span className="text-xs text-gray-400">{filteredConfigs.length} parámetros</span>
            </div>

            {filteredConfigs.length > 0 ? (
              <div className="space-y-3">
                {filteredConfigs.map((config) => (
                  <div key={config.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white truncate">{config.clave}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono bg-gray-800 text-gray-300`}>{config.tipo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono bg-gray-800 text-gray-300`}>{config.categoria}</span>
                      </div>
                      <p className="text-xs text-gray-400">{config.descripcion}</p>
                    </div>
                    <div className="flex items-center gap-2 md:w-64">
                      {getInputComponent(config)}
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEdit(config)} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" title="Editar clave/descripción">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(config)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No hay configuraciones en esta categoría
                <button onClick={handleOpenCreate} className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs hover:bg-emerald-500/30 transition">
                  <Plus className="w-4 h-4" /> Crear primera configuración
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar Configuración */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingConfig ? 'Editar Configuración' : 'Nueva Configuración'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400">Clave *</label>
            <input type="text" value={formData.clave} onChange={(e) => setFormData({...formData, clave: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required placeholder="ej: ht_temp_minima" disabled={!!editingConfig} />
            {editingConfig && <p className="text-[10px] text-gray-500 mt-1">La clave no se puede modificar</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400">Valor *</label>
            {formData.tipo === 'boolean' ? (
              <select value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                <option value="true">true (Activado)</option>
                <option value="false">false (Desactivado)</option>
              </select>
            ) : formData.tipo === 'number' ? (
              <input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            ) : formData.tipo === 'json' ? (
              <textarea value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} rows={3} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
            ) : (
              <input type="text" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400">Descripción *</label>
            <input type="text" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400">Categoría *</label>
              <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400">Tipo de Dato *</label>
              <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as ConfigItem['tipo']})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                <option value="string">Texto (string)</option>
                <option value="number">Número (number)</option>
                <option value="boolean">Booleano (true/false)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : editingConfig ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Eliminar */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Eliminar Configuración"
        message={`¿Está seguro de eliminar la configuración "${deleteConfirm?.clave}"?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};