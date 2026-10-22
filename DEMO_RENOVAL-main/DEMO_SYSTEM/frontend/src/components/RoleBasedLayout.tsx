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
  ChevronDown,
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
import { getTheme } from '../utils/theme';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const t = getTheme(isDarkMode);

  const allowedModules = useMemo(() => getAllowedModules(userRole), [userRole]);
  const allowedGroups = useMemo(() => getAllowedGroups(userRole), [userRole]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNavButtonClass = (viewName: string) => {
    const isActive = activeView === viewName;
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${
      isActive 
        ? `${t.sidebarItemActive} shadow-sm` 
        : t.sidebarItem
    }`;
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`${t.bgPrimary} min-h-screen flex ${t.textPrimary}`}>
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${t.sidebarBg} border-r p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Navegación principal"
      >
        <div className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <h1 className="text-xl font-black tracking-wider text-emerald-600 truncate">
              RENOVAL<span className="text-lime-600">SYS</span>
            </h1>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-emerald-100 transition"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-[10px] font-bold text-gray-500 tracking-wider">EMPRESA / SEDE</div>
            <div className="flex items-center gap-2 mt-0.5 font-bold text-xs truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Empresas RENOVAL • Lerma</span>
            </div>
          </div>

          <nav className="space-y-3 overflow-y-auto flex-1 pr-1" aria-label="Módulos">
            {allowedGroups.map((groupKey: string) => {
              const groupModules = MODULE_GROUPS[groupKey as keyof typeof MODULE_GROUPS];
              const visibleModules = groupModules.filter((m: string) => 
                allowedModules.some((am: ModuleConfig) => am.module === m)
              );
              
              if (visibleModules.length === 0) return null;

              return (
                <div key={groupKey}>
                  <div className="px-2 text-[10px] font-bold text-emerald-600 tracking-wider mb-1 uppercase">
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
                        aria-current={activeView === moduleKey ? 'page' : undefined}
                      >
                        {getIcon(moduleConfig.icon)}
                        <span className="truncate">{moduleConfig.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-emerald-200 space-y-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 hover:bg-emerald-200 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Claro' : 'Oscuro'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-100 text-red-700 font-semibold text-xs border border-red-200 hover:bg-red-200 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className={`p-3 lg:p-4 border-b ${t.headerBg} flex items-center justify-between gap-3 lg:gap-4`}>
          <div className="flex items-center gap-2 lg:gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
              aria-label="Abrir menú"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm lg:text-base font-bold truncate flex items-center gap-2">
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
              
              {activeView === 'dashboard' && <span className="text-[9px] lg:text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">{userRole}</span>}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 p-2 lg:px-3 lg:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-gray-500 hover:text-emerald-700 transition"
              aria-label="Buscar (Ctrl+K)"
            >
              <Search className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-emerald-600" />
              <span className="hidden lg:inline text-xs">Buscar...</span>
              <kbd className="hidden lg:inline bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] lg:text-[10px] text-emerald-600 border border-emerald-200">Ctrl K</kbd>
            </button>

            <button className="p-2 rounded-xl bg-emerald-100/60 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-200 transition" aria-label="Notificaciones">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 lg:p-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 transition hover:bg-emerald-200"
                aria-label="Menú de usuario"
                aria-expanded={isUserMenuOpen}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="hidden lg:inline text-xs font-semibold">{userName}</span>
                <span className="hidden md:inline lg:hidden text-[10px] px-1.5 py-0.5 bg-emerald-200 rounded">{userRole}</span>
                <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 lg:hidden" 
                    onClick={() => setIsUserMenuOpen(false)} 
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-48 lg:w-56 bg-white border border-emerald-200 rounded-xl shadow-2xl py-1 z-50 animate-slide-in">
                    <div className="px-3 py-2 border-b border-emerald-200">
                      <p className="text-xs font-bold text-emerald-700">{userName}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{userRole.toLowerCase()}</p>
                    </div>
                    <button 
                      onClick={() => { setIsDarkMode(!isDarkMode); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition"
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                    <button 
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-700 hover:bg-emerald-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-3 lg:p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto flex-1">
          {activeView === 'dashboard' ? (
            renderDashboard(userRole, userName)
          ) : (
            <div className="w-full">{children}</div>
          )}
        </main>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white border border-emerald-200 w-full max-w-xl rounded-2xl p-4 shadow-2xl space-y-4 text-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <Search className="w-5 h-5 text-emerald-600" />
              <input 
                type="text" 
                placeholder="Buscar por Lote, Cliente, Certificado o Cotización..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder-gray-500"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-xs bg-emerald-100 px-2 py-1 rounded text-emerald-700">ESC</button>
            </div>
            <div className="text-xs text-gray-500 px-1">
              Búsqueda en tiempo real conectada a la base de datos.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};