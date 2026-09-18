import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './components/DashboardLayout';
import { CotizadorForm } from './components/CotizadorForm';
import { GanttProduccion } from './components/GanttProduccion';
import { FitosanitarioView } from './components/FitosanitarioView';
import { CertificadosView } from './components/CertificadosView';
import { ClientesView } from './components/ClientesView';
import { FichasNormativasView } from './components/FichasNormativasView';
import { InventarioMaderaView } from './components/InventarioMaderaView';
import { InsumosClavadoView } from './components/InsumosClavadoView';
import { LogisticaDespachoView } from './components/LogisticaDespachoView';
import { GestionUsuariosView } from './components/GestionUsuariosView';
import { LoginForm } from './components/LoginForm';
import { calcularCotizacion } from './api/cotizaciones';
import type { CotizacionPayload, TokenResponse } from './types';

const queryClient = new QueryClient();

export const AppContent: React.FC = () => {
  const [user, setUser] = useState<TokenResponse | null>(() => {
    const token = localStorage.getItem('access_token');
    return token ? {
      access_token: token,
      token_type: 'bearer',
      user_info: {
        email: 'admin@renoval.com',
        nombre: 'Ing. Rafael',
        rol: 'ADMIN',
        area: 'Planta'
      }
    } : null;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  if (!user) {
    return <LoginForm onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const handleSaveCotizacion = async (payload: CotizacionPayload) => {
    try {
      const res = await calcularCotizacion(payload);
      alert(`Cotización guardada en MySQL. Folio: ${res.folio} - Utilidad: $${res.utilidad_unitaria} MXN`);
      setActiveView('dashboard');
    } catch {
      alert('Error al procesar y guardar la cotización.');
    }
  };

  return (
    <DashboardLayout 
      activeView={activeView} 
      onNavigate={(view) => setActiveView(view)} 
      onLogout={handleLogout}
      userName={user.user_info.nombre}
    >
      {activeView === 'cotizador' && (
        <CotizadorForm onSubmit={handleSaveCotizacion} />
      )}

      {activeView === 'inventario_madera' && (
        <InventarioMaderaView />
      )}

      {activeView === 'insumos_clavado' && (
        <InsumosClavadoView />
      )}

      {activeView === 'lotes' && (
        <GanttProduccion />
      )}

      {activeView === 'fitosanitario' && (
        <FitosanitarioView />
      )}

      {activeView === 'certificados' && (
        <CertificadosView />
      )}

      {activeView === 'logistica' && (
        <LogisticaDespachoView />
      )}

      {activeView === 'clientes' && (
        <ClientesView />
      )}

      {activeView === 'usuarios' && (
        <GestionUsuariosView />
      )}

      {activeView === 'fichas' && (
        <FichasNormativasView />
      )}
    </DashboardLayout>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;