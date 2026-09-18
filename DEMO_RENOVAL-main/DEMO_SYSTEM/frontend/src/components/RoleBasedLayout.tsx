import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Sun, 
  Moon, 
  Bell, 
  LayoutDashboard, 
  Calculator, 
  PackageCheck, 
  Users, 
  Flame, 
  FolderOpen, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  TrendingUp,
  Boxes,
  Loader2,
  Search,
  Layers,
  Truck,
  UserCheck,
  ShieldCheck,
  Trees,
  Package,
  Factory,
  GanttChart,
  Settings,
  FileText,
  Award,
  UserCog,
} from 'lucide-react';
import { type ModuleConfig, type Role } from '../types';
import { 
  MODULE_CONFIG, 
  MODULE_GROUPS, 
  GROUP_LABELS,
  getAllowedModules,
  getAllowedGroups 
} from '../hooks/usePermissions';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { OperadorDashboard } from './dashboards/OperadorDashboard';
import { AlmacenistaDashboard } from './dashboards/AlmacenistaDashboard';
import { ClienteDashboard } from './dashboards/ClienteDashboard';
import { ProveedorDashboard } from './dashboards/ProveedorDashboard';

interface RoleBasedLayoutProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole: Role;
  children?: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Calculator: <Calculator className="w-4 h-4" />,
  PackageCheck: <PackageCheck className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  FolderOpen: <FolderOpen className="w-4 h-4" />,
  LogOut: <LogOut className="w-3.5 h-3.5" />,
  Menu: <Menu className="w-5 h-5" />,
  X: <X className="w-6 h-6" />,
  PlusCircle: <PlusCircle className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Boxes: <Boxes className="w-4 h-4" />,
  Loader2: <Loader2 className="w-8 h-8 animate-spin" />,
  Search: <Search className="w-5 h-5" />,
  Layers: <Layers className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  UserCheck: <UserCheck className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Trees: <Trees className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Factory: <Factory className="w-4 h-4" />,
  GanttChart: <GanttChart className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  UserCog: <UserCog className="w-4 h-4" />,
};

const getIcon = (iconName: string) => ICON_MAP[iconName] || <LayoutDashboard className="w-4 h-4" />;

const renderDashboard = (role: Role, userName: string) => {
  switch (role) {
    case 'ADMIN':
      return <AdminDashboard userName={userName} />;
    case 'OPERADOR':
      return <OperadorDashboard userName={userName} />;
    case 'ALMACENISTA':
      return <AlmacenistaDashboard userName={userName} />;
    case 'CLIENTE':
      return <ClienteDashboard userName={userName} />;
    case 'PROVEEDOR':
      return <ProveedorDashboard userName={userName} />;
    default:
      return <AdminDashboard userName={userName} />;
  }
};

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ 
  activeView, 
  onNavigate, 
  onLogout, 
  userName = "Usuario", 
  userRole,
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allowedModules = useMemo(() => getAllowedModules(userRole), [userRole]);
  const allowedGroups = useMemo(() => getAllowedGroups(userRole), [userRole]);

  const getNavButtonClass = (viewName: string) => {
    const isActive = activeView === viewName;
    return `w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition ${
      isActive 
        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm' 
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
    }`;
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#0a0d14] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Modal Buscador Global */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-sm">
          <div className="bg-[#10141d] border border-[#1e2430] w-full max-w-xl rounded-2xl p-4 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 bg-[#181d29] border border-[#252c3d] px-3 py-2 rounded-xl">
              <Search className="w-5 h-5 text-emerald-400" />
              <input 
                type="text" 
                placeholder="Buscar por Lote, Cliente, Certificado o Cotización..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">ESC</button>
            </div>
            <div className="text-xs text-gray-400 px-1">
              Búsqueda en tiempo real conectada a la base de datos.
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${
          isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'
        } border-r p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          <div className="flex justify-between items-center px-2 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <h1 className="text-2xl font-black tracking-wider text-emerald-400">
              RENOVAL<span className="text-lime-400">SYS</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-[9px] font-bold text-gray-400 tracking-wider">EMPRESA / SEDE</div>
              <div className="flex items-center gap-2 mt-0.5 font-bold text-xs truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Empresas RENOVAL • Lerma</span>
              </div>
            </div>
          </div>

          <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {allowedGroups.map((groupKey: string) => {
              const groupModules = MODULE_GROUPS[groupKey as keyof typeof MODULE_GROUPS];
              const visibleModules = groupModules.filter((m: string) => 
                allowedModules.some((am: ModuleConfig) => am.module === m)
              );
              
              if (visibleModules.length === 0) return null;

              return (
                <div key={groupKey}>
                  <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-1">
                    {GROUP_LABELS[groupKey] || groupKey.toUpperCase()}
                  </div>
                  {visibleModules.map((moduleKey: string, idx: number) => {
                    const moduleConfig = MODULE_CONFIG[moduleKey];
                    if (!moduleConfig) return null;
                    
                    return (
                      <button 
                        key={moduleKey}
                        onClick={() => handleNavClick(moduleKey)}
                        className={`${getNavButtonClass(moduleKey)} ${idx > 0 ? 'mt-1' : ''}`}
                      >
                        {getIcon(moduleConfig.icon)}
                        <span>{moduleConfig.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-gray-800 space-y-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 font-semibold text-[11px] border border-yellow-500/20 hover:bg-yellow-500/20 transition"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'Claro' : 'Oscuro'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 font-semibold text-[11px] border border-red-500/20 hover:bg-red-500/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className={`p-4 border-b ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'} flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold truncate flex items-center gap-2">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'cotizaciones' && 'Cotizador Paramétrico'}
              {activeView === 'inventario_madera' && 'Inventario Madera (PT)'}
              {activeView === 'insumos' && 'Control de Insumos'}
              {activeView === 'produccion' && 'Control de Producción'}
              {activeView === 'gantt' && 'Diagrama de Gantt'}
              {activeView === 'fitosanitario' && 'Fitosanitario (NOM-144)'}
              {activeView === 'certificados' && 'Certificados HT'}
              {activeView === 'logistica' && 'Logística y Despacho'}
              {activeView === 'clientes' && 'Catálogo de Clientes'}
              {activeView === 'usuarios' && 'Gestión de Usuarios'}
              {activeView === 'reportes' && 'Reportes'}
              {activeView === 'configuracion' && 'Configuración'}
              
              {activeView === 'dashboard' && <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">{userRole}</span>}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-[#181d29] border border-[#252c3d] px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white transition"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buscar...</span>
              <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-400 border border-gray-700">Ctrl K</kbd>
            </button>

            <button className="p-2 rounded-xl bg-gray-800/60 text-gray-300 hover:text-white">
              <Bell className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{userName}</span>
              <span className="px-2 py-0.5 bg-emerald-900 rounded text-[10px]">{userRole}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 overflow-y-auto">
          {activeView === 'dashboard' ? (
            renderDashboard(userRole, userName)
          ) : (
            <div>{children}</div>
          )}
        </main>
      </div>
    </div>
  );
};