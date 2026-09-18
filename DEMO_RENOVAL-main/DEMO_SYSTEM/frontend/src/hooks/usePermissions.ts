import { useQuery } from '@tanstack/react-query';
import { type ModuleConfig, type Role } from '../types';

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  dashboard: { module: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  clientes: { module: 'clientes', label: 'Clientes', icon: 'Users', path: '/clientes' },
  cotizaciones: { module: 'cotizaciones', label: 'Cotizaciones', icon: 'Calculator', path: '/cotizaciones' },
  inventario_madera: { module: 'inventario_madera', label: 'Inventario Madera', icon: 'Trees', path: '/almacen/madera' },
  insumos: { module: 'insumos', label: 'Insumos', icon: 'Package', path: '/almacen/insumos' },
  produccion: { module: 'produccion', label: 'Producción', icon: 'Factory', path: '/produccion' },
  gantt: { module: 'gantt', label: 'Diagrama de Gantt', icon: 'GanttChart', path: '/produccion/gantt' },
  fitosanitario: { module: 'fitosanitario', label: 'Fitosanitario (NOM-144)', icon: 'Shield', path: '/fitosanitario' },
  logistica: { module: 'logistica', label: 'Logística y Despacho', icon: 'Truck', path: '/logistica' },
  certificados: { module: 'certificados', label: 'Certificados HT', icon: 'Award', path: '/certificados' },
  usuarios: { module: 'usuarios', label: 'Gestión de Usuarios', icon: 'UserCog', path: '/usuarios' },
  reportes: { module: 'reportes', label: 'Reportes', icon: 'FileText', path: '/reportes' },
  configuracion: { module: 'configuracion', label: 'Configuración', icon: 'Settings', path: '/configuracion' },
};

export const ROLE_MODULES: Record<Role, string[]> = {
  ADMIN: Object.keys(MODULE_CONFIG),
  CLIENTE: ['dashboard', 'cotizaciones', 'logistica', 'certificados'],
  OPERADOR: ['dashboard', 'produccion', 'gantt', 'fitosanitario', 'inventario_madera'],
  ALMACENISTA: ['dashboard', 'inventario_madera', 'insumos', 'logistica', 'certificados'],
  PROVEEDOR: ['dashboard', 'logistica', 'certificados'],
};

export const MODULE_GROUPS = {
  operaciones: ['dashboard', 'cotizaciones'],
  almacen: ['inventario_madera', 'insumos'],
  produccion: ['produccion', 'gantt', 'fitosanitario', 'certificados'],
  logistica: ['logistica'],
  administracion: ['clientes', 'usuarios', 'reportes', 'configuracion'],
} as const;

export const GROUP_LABELS: Record<string, string> = {
  operaciones: 'OPERACIONES',
  almacen: 'MATERIA PRIMA & ALMACÉN',
  produccion: 'PRODUCCIÓN & NORMATIVA',
  logistica: 'LOGÍSTICA & DESPACHO',
  administracion: 'ADMINISTRACIÓN',
};

export function getAllowedModules(role: Role): ModuleConfig[] {
  const moduleKeys = ROLE_MODULES[role] || [];
  return moduleKeys.map(key => MODULE_CONFIG[key]).filter(Boolean);
}

export function getAllowedGroups(role: Role): string[] {
  const modules = ROLE_MODULES[role] || [];
  return Object.entries(MODULE_GROUPS)
    .filter(([, groupModules]) => groupModules.some(m => modules.includes(m)))
    .map(([key]) => key);
}

export function useUserModules(role: Role) {
  return useQuery({
    queryKey: ['user-modules', role],
    queryFn: async () => {
      const response = await fetch(`/api/v1/auth/me/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener módulos');
      return response.json() as Promise<ModuleConfig[]>;
    },
    enabled: !!role,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}