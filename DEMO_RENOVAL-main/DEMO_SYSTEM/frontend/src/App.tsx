import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleBasedLayout } from './components/RoleBasedLayout';
import { CotizadorForm } from './components/CotizadorForm';
import { GanttProduccion } from './components/GanttProduccion';
import { FitosanitarioView } from './components/FitosanitarioView';
import { CertificadosView } from './components/CertificadosView';
import { ClientesView } from './components/ClientesView';
import { InventarioMaderaView } from './components/InventarioMaderaView';
import { InsumosClavadoView } from './components/InsumosClavadoView';
import { LogisticaDespachoView } from './components/LogisticaDespachoView';
import { GestionUsuariosView } from './components/GestionUsuariosView';
import { LoginForm } from './components/LoginForm';
import { calcularCotizacion } from './api/cotizaciones';
import type { CotizacionPayload, TokenResponse, Role } from './types';
import { getUserModules } from './api/auth';

const queryClient = new QueryClient();

export const AppContent: React.FC = () => {
  const [user, setUser] = useState<TokenResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          access_token: token,
          token_type: 'bearer',
          user_info: {
            id: 0,
            username: '',
            email: payload.sub || '',
            nombre: 'Usuario',
            rol: payload.rol || 'ADMIN',
            area: 'Planta'
          }
        });
      } catch {
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [userModules, setUserModules] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      getUserModules()
        .then(modules => setUserModules(modules.map(m => m.module)))
        .catch(() => setUserModules([]));
    }
  }, [user]);

  if (!user) {
    return <LoginForm onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const userRole = user.user_info.rol as Role;
  const allowedViews = userModules.length > 0 ? userModules : ['dashboard'];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setUserModules([]);
  };

  const handleSaveCotizacion = async (payload: CotizacionPayload) => {
    try {
      const res = await calcularCotizacion(payload);
      alert(`Cotización guardada. Folio: ${res.folio} - Utilidad: $${res.utilidad_unitaria} MXN`);
      setActiveView('dashboard');
    } catch {
      alert('Error al procesar y guardar la cotización.');
    }
  };

  const renderView = () => {
    if (!allowedViews.includes(activeView)) {
      setActiveView(allowedViews[0] || 'dashboard');
      return null;
    }

    switch (activeView) {
      case 'cotizaciones': return <CotizadorForm onSubmit={handleSaveCotizacion} />;
      case 'inventario_madera': return <InventarioMaderaView />;
      case 'insumos': return <InsumosClavadoView />;
      case 'produccion': return <GanttProduccion />;
      case 'gantt': return <GanttProduccion />;
      case 'fitosanitario': return <FitosanitarioView />;
      case 'certificados': return <CertificadosView />;
      case 'logistica': return <LogisticaDespachoView />;
      case 'clientes': return <ClientesView />;
      case 'usuarios': return <GestionUsuariosView />;
      case 'reportes': return <div className="text-center py-12 text-gray-400">Reportes - En desarrollo</div>;
      case 'configuracion': return <div className="text-center py-12 text-gray-400">Configuración - En desarrollo</div>;
      default: return null;
    }
  };

  return (
    <RoleBasedLayout 
      activeView={activeView} 
      onNavigate={(view) => setActiveView(view)} 
      onLogout={handleLogout}
      userName={user.user_info.nombre}
      userRole={userRole}
    >
      {renderView()}
    </RoleBasedLayout>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;