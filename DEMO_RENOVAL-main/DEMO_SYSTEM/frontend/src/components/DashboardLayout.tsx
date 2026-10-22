import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../api/dashboard';
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
  ChevronDown,
} from 'lucide-react';
import { getTheme } from '../utils/theme';

interface DashboardLayoutProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  activeView, 
  onNavigate, 
  onLogout, 
  userName = "Ing. Rafael", 
  userRole = "ADMIN",
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const t = getTheme(isDarkMode);

  const { data: metrics, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30000,
    staleTime: 15000,
  });

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

  const navSections = [
    {
      label: 'OPERACIONES',
      items: [
        { key: 'dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
        { key: 'cotizaciones', icon: Calculator, label: 'Cotizador Paramétrico' },
      ]
    },
    {
      label: 'MATERIA PRIMA & ALMACÉN',
      items: [
        { key: 'inventario_madera', icon: Boxes, label: 'Cubaje & Madera (PT)' },
        { key: 'insumos', icon: Layers, label: 'Insumos & Clavado' },
      ]
    },
    {
      label: 'PRODUCCIÓN & NORMATIVA',
      items: [
        { key: 'gantt', icon: PackageCheck, label: 'Lotes Activos (Gantt)' },
        { key: 'fitosanitario', icon: Flame, label: 'Tratamiento Fitosanitario' },
        { key: 'certificados', icon: ShieldCheck, label: 'Certificados NOM-144' },
      ]
    },
    {
      label: 'LOGÍSTICA & DESPACHO',
      items: [
        { key: 'logistica', icon: Truck, label: 'Embarques & Salidas' },
      ]
    },
    {
      label: 'ADMINISTRACIÓN',
      items: [
        { key: 'clientes', icon: Users, label: 'Catálogo de Clientes' },
        { key: 'usuarios', icon: UserCheck, label: 'Personal & Permisos' },
        { key: 'fichas', icon: FolderOpen, label: 'Fichas Normativas' },
      ]
    },
  ];

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
            {navSections.map((section) => (
              <div key={section.label}>
                <div className="px-2 text-[10px] font-bold text-emerald-600 tracking-wider mb-1 uppercase">
                  {section.label}
                </div>
                {section.items.map((item, idx) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`${getNavButtonClass(item.key)} ${idx > 0 ? 'mt-1' : ''}`}
                    aria-current={activeView === item.key ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
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
              {activeView === 'dashboard' && 'Resumen Operativo'}
              {activeView === 'cotizaciones' && 'Cotizador Paramétrico de Madera'}
              {activeView === 'inventario_madera' && 'Inventario & Cubaje de Madera'}
              {activeView === 'insumos' && 'Control de Insumos & Clavado'}
              {activeView === 'gantt' && 'Control de Producción & Gantt'}
              {activeView === 'fitosanitario' && 'Control Fitosanitario (NOM-144)'}
              {activeView === 'certificados' && 'Certificados Fitosanitarios PDF'}
              {activeView === 'logistica' && 'Embarques & Despacho'}
              {activeView === 'clientes' && 'Catálogo de Clientes & Créditos'}
              {activeView === 'usuarios' && 'Personal & Permisos'}
              {activeView === 'fichas' && 'Fichas Normativas & Planos'}
              
              {isFetching && activeView === 'dashboard' && (
                <span className="text-[9px] lg:text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">Sincronizando...</span>
              )}
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
            <>
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4 shadow-lg shadow-emerald-900/30">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg lg:text-xl border border-white/30 flex-shrink-0">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg lg:text-2xl font-black truncate">Bienvenido, {userName}.</h3>
                    <p className="text-emerald-100 text-xs lg:text-sm truncate">Planta Lerma • Ingeniero de Producción</p>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button 
                    onClick={() => onNavigate('cotizaciones')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-lime-400 text-emerald-950 font-extrabold px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl shadow-md hover:bg-lime-300 transition text-sm lg:text-base"
                  >
                    <PlusCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Nueva Cotización</span>
                  </button>
                </div>
              </div>

              {isLoading && !metrics ? (
                <div className="flex justify-center items-center py-12 text-emerald-600">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Cargando datos en tiempo real desde MySQL...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${t.bgCard} ${t.borderPrimary}`}>
                      <span className="text-[9px] lg:text-xs font-bold text-gray-500 tracking-wider">TARIMAS PRODUCIDAS (MES)</span>
                      <div className="text-2xl lg:text-4xl font-black text-emerald-600 mt-1">
                        {metrics?.tarimas_producidas?.toLocaleString() ?? 0}
                      </div>
                      <div className="text-[9px] lg:text-xs text-gray-500 mt-1">
                        {metrics?.lotes_completados ?? 0} lotes completados
                      </div>
                    </div>

                    <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${t.bgCard} ${t.borderPrimary}`}>
                      <div className="flex items-center gap-2 text-[9px] lg:text-xs font-bold text-gray-500 tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600" />
                        <span>MARGEN UTILIDAD PROMEDIO</span>
                      </div>
                      <div className="text-2xl lg:text-4xl font-black mt-1 text-lime-600">
                        {metrics?.utilidad_promedio_pct ?? 0}%
                      </div>
                      <div className="text-[9px] lg:text-xs text-gray-500 mt-1">
                        +${metrics?.utilidad_promedio_monto ?? 0} MXN por unidad
                      </div>
                    </div>

                    <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${t.bgCard} ${t.borderPrimary}`}>
                      <div className="flex items-center gap-2 text-[9px] lg:text-xs font-bold text-amber-600 tracking-wider mb-3">
                        <Boxes className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        <span>MODELOS MÁS COTIZADOS</span>
                      </div>
                      <div className="space-y-2 text-xs lg:text-sm">
                        {(metrics?.top_modelos || []).map((model, idx) => (
                          <div key={idx} className="flex justify-between border-b border-emerald-200 pb-2 last:border-0">
                            <span className="text-gray-600 truncate pr-2">{model.nombre}</span>
                            <span className="font-bold text-emerald-600 whitespace-nowrap">{model.unidades.toLocaleString()} u</span>
                          </div>
                        ))}
                        {(metrics?.top_modelos?.length === 0 || !metrics?.top_modelos) && (
                          <div className="text-center text-gray-500 py-2">Sin datos de cotizaciones</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${t.bgCard} ${t.borderPrimary}`}>
                    <h4 className="text-[9px] lg:text-xs font-bold text-gray-500 tracking-wider mb-3">ESTATUS DE TRATAMIENTO FITOSANITARIO (NOM-144)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                      <div className={`p-3 lg:p-4 rounded-xl border ${t.bgCard} ${t.borderSecondary}`}>
                        <div className="text-[9px] lg:text-xs text-gray-500">ESTUFADO HT EN PROCESO</div>
                        <div className="text-lg lg:text-xl font-bold mt-1 text-amber-600">
                          {metrics?.ht_en_proceso_lotes ?? 0} Lotes ({(metrics?.ht_en_proceso_piezas ?? 0).toLocaleString()} pzs)
                        </div>
                      </div>
                      <div className={`p-3 lg:p-4 rounded-xl border ${t.bgCard} ${t.borderSecondary}`}>
                        <div className="text-[9px] lg:text-xs text-gray-500">CERTIFICADOS LIBERADOS</div>
                        <div className="text-lg lg:text-xl font-bold mt-1 text-emerald-600">
                          {metrics?.certificados_liberados ?? 0} Certificados
                        </div>
                      </div>
                      <div className={`p-3 lg:p-4 rounded-xl border ${t.bgCard} ${t.borderSecondary}`}>
                        <div className="text-[9px] lg:text-xs text-gray-500">SELLOS HT DISPONIBLES</div>
                        <div className="text-lg lg:text-xl font-bold mt-1">Conforme a norma</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
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
                placeholder="Buscar por Lote (LOT-2026-001), Cliente, Certificado o Cotización..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder-gray-500"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-xs bg-emerald-100 px-2 py-1 rounded text-emerald-700">ESC</button>
            </div>
            <div className="text-xs text-gray-500 px-1">
              Búsqueda en tiempo real conectada a la base de datos MySQL.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};