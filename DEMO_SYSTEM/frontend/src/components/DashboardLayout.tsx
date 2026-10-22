import React, { useState, useEffect } from 'react';
import { probeApiConnection } from '../api/axios';
import { useConnectionStatus } from '../api/connection';
import { ErrorBoundary } from './ErrorBoundary';
import { DashboardView } from '../views/DashboardView';
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
  Loader2,
  Search,
  Layers,
  Boxes,
  Truck,
  UserCheck,
  ShieldCheck,
  Wifi,
  WifiOff,
  ClipboardCheck
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

  const conexion = useConnectionStatus();

  // Sonda periódica del backend: es la única fuente que marca "API en línea"
  useEffect(() => {
    void probeApiConnection();
    const intervalo = window.setInterval(() => {
      void probeApiConnection();
    }, 15000);
    return () => window.clearInterval(intervalo);
  }, []);

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
                <span>Inventario de Tarimas (PT)</span>
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
              <button onClick={() => handleNavClick('logistica_embarques')} className={getNavButtonClass('logistica_embarques')}>
                <Truck className="w-4 h-4" />
                <span>Embarques & Salidas</span>
              </button>
              <button onClick={() => handleNavClick('logistica_aprobaciones')} className={`${getNavButtonClass('logistica_aprobaciones')} mt-1`}>
                <ClipboardCheck className="w-4 h-4" />
                <span>Aprobación de Viajes</span>
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
              {activeView === 'inventario_madera' && 'Inventario de Tarimas & Cubaje de Madera'}
              {activeView === 'insumos_clavado' && 'Control de Insumos & Clavado'}
              {activeView === 'lotes' && 'Control de Producción & Gantt'}
              {activeView === 'fitosanitario' && 'Control Fitosanitario (NOM-144)'}
              {activeView === 'certificados' && 'Certificados Fitosanitarios PDF'}
              {activeView === 'logistica_embarques' && 'Embarques & Salidas'}
              {activeView === 'logistica_aprobaciones' && 'Aprobación de Viajes & Fletes'}
              {activeView === 'logistica' && 'Embarques & Despacho'}
              {activeView === 'clientes' && 'Catálogo de Clientes & Créditos'}
              {activeView === 'usuarios' && 'Personal & Permisos'}
              {activeView === 'fichas' && 'Fichas Normativas & Planos'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {conexion === 'checking' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700 text-gray-400 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verificando API...</span>
              </div>
            )}

            {conexion === 'online' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold">
                <Wifi className="w-3.5 h-3.5" />
                <span>API en línea</span>
              </div>
            )}

            {conexion === 'offline' && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-xs font-semibold"
                title="Backend no disponible: los datos provienen del Modo Demo"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Modo Demo</span>
              </div>
            )}

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
          <ErrorBoundary key={activeView} label={activeView}>
            {activeView === 'dashboard' ? (
              <DashboardView userName={userName} onNavigate={onNavigate} isDarkMode={isDarkMode} />
            ) : (
              <div key={`/${activeView}`}>{children}</div>
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};