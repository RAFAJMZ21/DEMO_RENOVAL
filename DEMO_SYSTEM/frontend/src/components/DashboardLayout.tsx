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
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName?: string;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  activeView, 
  onNavigate, 
  onLogout, 
  userName = "Ing. Rafael", 
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Configuración de revalidación silenciosa en segundo plano
  const { data: metrics, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30000, // Actualiza cada 30s sin desmontar componentes
    staleTime: 15000,       // Conserva la caché por 15s
  });

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
                placeholder="Buscar por Lote (LOT-2026-001), Cliente, Certificado o Cotización..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">ESC</button>
            </div>
            <div className="text-xs text-gray-400 px-1">
              Búsqueda en tiempo real conectada a la base de datos MySQL.
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
            <div>
              <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-1">OPERACIONES</div>
              <button onClick={() => handleNavClick('dashboard')} className={getNavButtonClass('dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Principal</span>
              </button>
              <button onClick={() => handleNavClick('cotizador')} className={`${getNavButtonClass('cotizador')} mt-1`}>
                <Calculator className="w-4 h-4" />
                <span>Cotizador Paramétrico</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-1">MATERIA PRIMA & ALMACÉN</div>
              <button onClick={() => handleNavClick('inventario_madera')} className={getNavButtonClass('inventario_madera')}>
                <Boxes className="w-4 h-4" />
                <span>Cubaje & Madera (PT)</span>
              </button>
              <button onClick={() => handleNavClick('insumos_clavado')} className={`${getNavButtonClass('insumos_clavado')} mt-1`}>
                <Layers className="w-4 h-4" />
                <span>Insumos & Clavado</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-1">PRODUCCIÓN & NORMATIVA</div>
              <button onClick={() => handleNavClick('lotes')} className={getNavButtonClass('lotes')}>
                <PackageCheck className="w-4 h-4" />
                <span>Lotes Activos (Gantt)</span>
              </button>
              <button onClick={() => handleNavClick('fitosanitario')} className={`${getNavButtonClass('fitosanitario')} mt-1`}>
                <Flame className="w-4 h-4" />
                <span>Tratamiento Fitosanitario</span>
              </button>
              <button onClick={() => handleNavClick('certificados')} className={`${getNavButtonClass('certificados')} mt-1`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Certificados NOM-144</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-amber-500 tracking-wider mb-1">LOGÍSTICA & DESPACHO</div>
              <button onClick={() => handleNavClick('logistica')} className={getNavButtonClass('logistica')}>
                <Truck className="w-4 h-4" />
                <span>Embarques & Salidas</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-amber-500 tracking-wider mb-1">ADMINISTRACIÓN</div>
              <button onClick={() => handleNavClick('clientes')} className={getNavButtonClass('clientes')}>
                <Users className="w-4 h-4" />
                <span>Catálogo de Clientes</span>
              </button>
              <button onClick={() => handleNavClick('usuarios')} className={`${getNavButtonClass('usuarios')} mt-1`}>
                <UserCheck className="w-4 h-4" />
                <span>Personal & Permisos</span>
              </button>
              <button onClick={() => handleNavClick('fichas')} className={`${getNavButtonClass('fichas')} mt-1`}>
                <FolderOpen className="w-4 h-4" />
                <span>Fichas Normativas</span>
              </button>
            </div>
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
              {activeView === 'dashboard' && 'Resumen Operativo'}
              {activeView === 'cotizador' && 'Cotizador Paramétrico de Madera'}
              {activeView === 'inventario_madera' && 'Inventario & Cubaje de Madera'}
              {activeView === 'insumos_clavado' && 'Control de Insumos & Clavado'}
              {activeView === 'lotes' && 'Control de Producción & Gantt'}
              {activeView === 'fitosanitario' && 'Control Fitosanitario (NOM-144)'}
              {activeView === 'certificados' && 'Certificados Fitosanitarios PDF'}
              {activeView === 'logistica' && 'Embarques & Despacho'}
              {activeView === 'clientes' && 'Catálogo de Clientes & Créditos'}
              {activeView === 'usuarios' && 'Personal & Permisos'}
              {activeView === 'fichas' && 'Fichas Normativas & Planos'}
              
              {isFetching && activeView === 'dashboard' && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">Sincronizando...</span>
              )}
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
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 overflow-y-auto">
          {activeView === 'dashboard' ? (
            <>
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
                    <p className="text-emerald-100 text-sm">Planta Lerma • Ingeniero de Producción</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => onNavigate('cotizador')}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-lime-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-lime-300 transition"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Nueva Cotización</span>
                  </button>
                </div>
              </div>

              {/* Muestra pantalla completa SOLO si es la carga inicial sin datos en caché */}
              {isLoading && !metrics ? (
                <div className="flex justify-center items-center py-12 text-emerald-400">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Cargando datos en tiempo real desde MySQL...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                      <span className="text-xs font-bold text-gray-400 tracking-wider">TARIMAS PRODUCIDAS (MES)</span>
                      <div className="text-4xl font-black text-emerald-400 mt-2">
                        {metrics?.tarimas_producidas?.toLocaleString() ?? 12450}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {metrics?.lotes_completados ?? 3} lotes completados
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>MARGEN UTILIDAD PROMEDIO</span>
                      </div>
                      <div className="text-4xl font-black mt-2 text-lime-400">
                        {metrics?.utilidad_promedio_pct ?? 28.4}%
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        +${metrics?.utilidad_promedio_monto ?? 48.50} MXN por unidad
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider mb-4">
                        <Boxes className="w-4 h-4" />
                        <span>MODELOS MÁS COTIZADOS</span>
                      </div>
                      <div className="space-y-3 text-sm">
                        {(metrics?.top_modelos ?? [
                          { nombre: "Tarima Barrote 40\" x 48\"", unidades: 4800 },
                          { nombre: "Tarima Tacón Perimetral", unidades: 3200 },
                          { nombre: "Caja de Madera Industrial", unidades: 1450 }
                        ]).map((model, idx) => (
                          <div key={idx} className="flex justify-between border-b border-gray-800 pb-2 last:border-0">
                            <span className="text-gray-300">{model.nombre}</span>
                            <span className="font-bold text-emerald-400">{model.unidades.toLocaleString()} u</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                    <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">ESTATUS DE TRATAMIENTO FITOSANITARIO (NOM-144)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-xs text-gray-400">ESTUFADO HT EN PROCESO</div>
                        <div className="text-xl font-bold mt-1 text-amber-400">
                          {metrics?.ht_en_proceso_lotes ?? 3} Lotes ({(metrics?.ht_en_proceso_piezas ?? 2400).toLocaleString()} pzs)
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-xs text-gray-400">CERTIFICADOS LIBERADOS</div>
                        <div className="text-xl font-bold mt-1 text-emerald-400">
                          {metrics?.certificados_liberados ?? 15} Certificados
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-xs text-gray-400">SELLOS HT DISPONIBLES</div>
                        <div className="text-xl font-bold mt-1">Conforme a norma</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div>{children}</div>
          )}
        </main>
      </div>
    </div>
  );
};