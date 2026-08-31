import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../api/dashboard';
import { 
  Building2, 
  Factory, 
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
  Loader2
} from 'lucide-react';

export const DashboardLayout: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 10000,
  });

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#0a0d14] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${
          isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'
        } border-r p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h1 className="text-2xl font-black tracking-wider text-emerald-400">
              RENOVAL<span className="text-lime-400">SYS</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-[10px] font-bold text-gray-400 tracking-wider">EMPRESA</div>
              <div className="flex items-center gap-2 mt-1 font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Empresas RENOVAL</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-[10px] font-bold text-gray-400 tracking-wider">PLANTA / SEDE</div>
              <div className="flex items-center gap-2 mt-1 font-bold text-sm truncate">
                <Factory className="w-4 h-4 text-emerald-400" />
                <span className="truncate">Planta Lerma</span>
              </div>
            </div>
          </div>

          <nav className="space-y-4">
            <div>
              <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-2">OPERACIONES</div>
              <button onClick={() => onNavigate?.('dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-semibold text-sm">
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Principal</span>
              </button>
              <button onClick={() => onNavigate?.('cotizador')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium text-sm mt-1 transition">
                <Calculator className="w-4 h-4" />
                <span>Cotizador Paramétrico</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-emerald-400 tracking-wider mb-2">PRODUCCIÓN & HT</div>
              <button onClick={() => onNavigate?.('lotes')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium text-sm transition">
                <PackageCheck className="w-4 h-4" />
                <span>Lotes Activos</span>
              </button>
              <button onClick={() => onNavigate?.('fitosanitario')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium text-sm mt-1 transition">
                <Flame className="w-4 h-4" />
                <span>Tratamiento Fitosanitario</span>
              </button>
            </div>

            <div>
              <div className="px-2 text-[10px] font-bold text-amber-500 tracking-wider mb-2">ADMINISTRACIÓN</div>
              <button onClick={() => onNavigate?.('clientes')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium text-sm transition">
                <Users className="w-4 h-4" />
                <span>Catálogo de Clientes</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-800 space-y-2">
          <button onClick={() => onNavigate?.('fichas')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium text-sm transition">
            <FolderOpen className="w-4 h-4" />
            <span>Fichas Normativas</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 font-semibold text-xs border border-yellow-500/20 hover:bg-yellow-500/20 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Claro' : 'Oscuro'}</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-400 font-semibold text-xs border border-red-500/20 hover:bg-red-500/20 transition">
              <LogOut className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className={`p-4 border-b ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Resumen Operativo</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-gray-800/60 text-gray-300 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ing. Rafael</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 overflow-y-auto">
          
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
                RF
              </div>
              <div>
                <h3 className="text-2xl font-black">Bienvenido, Rafael.</h3>
                <p className="text-emerald-100 text-sm">Planta Lerma • Ingeniero de Producción</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => onNavigate?.('cotizador')}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-lime-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-lime-300 transition"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Nueva Cotización</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-emerald-400">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Cargando datos en tiempo real desde MySQL...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                  <span className="text-xs font-bold text-gray-400 tracking-wider">TARIMAS PRODUCIDAS (MES)</span>
                  <div className="text-4xl font-black text-emerald-400 mt-2">{metrics?.tarimas_producidas.toLocaleString() ?? 0}</div>
                  <div className="text-xs text-gray-400 mt-2">{metrics?.lotes_completados ?? 0} lotes completados</div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>MARGEN UTILIDAD PROMEDIO</span>
                  </div>
                  <div className="text-4xl font-black mt-2 text-lime-400">{metrics?.utilidad_promedio_pct ?? 0}%</div>
                  <div className="text-xs text-gray-400 mt-2">+${metrics?.utilidad_promedio_monto ?? 0} MXN por unidad</div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#10141d] border-[#1e2430]' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider mb-4">
                    <Boxes className="w-4 h-4" />
                    <span>MODELOS MÁS COTIZADOS</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {metrics?.top_modelos.map((model, idx) => (
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
                    <div className="text-xl font-bold mt-1 text-amber-400">{metrics?.ht_en_proceso_lotes ?? 0} Lotes ({(metrics?.ht_en_proceso_piezas ?? 0).toLocaleString()} pzs)</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xs text-gray-400">CERTIFICADOS LIBERADOS</div>
                    <div className="text-xl font-bold mt-1 text-emerald-400">{metrics?.certificados_liberados ?? 0} Certificados</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#181d29] border-[#252c3d]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xs text-gray-400">SELLOS HT DISPONIBLES</div>
                    <div className="text-xl font-bold mt-1">Conforme a norma</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};