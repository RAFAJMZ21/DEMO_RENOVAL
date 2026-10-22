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
import { LogisticaEmbarquesView } from './components/LogisticaEmbarquesView';
import { GestionUsuariosView } from './components/GestionUsuariosView';
import { LoginForm } from './components/LoginForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/auth';
import { calcularCotizacion } from './api/cotizaciones';
import type { CotizacionPayload } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppContent: React.FC = () => {
  const { user, login, loginDemo, logout } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');

  if (!user) {
    return <LoginForm onLoginSuccess={login} onDemoLogin={loginDemo} />;
  }

  const handleSaveCotizacion = async (payload: CotizacionPayload) => {
    try {
      const res = await calcularCotizacion(payload);
      alert(`Cotización guardada. Folio: ${res.folio} - Utilidad: $${res.utilidad_unitaria} MXN`);
      setActiveView('dashboard');
    } catch {
      alert('Error al procesar y guardar la cotización.');
    }
  };

  const renderView = (): React.ReactNode => {
    switch (activeView) {
      case 'cotizador':
        return <CotizadorForm onSubmit={handleSaveCotizacion} />;
      case 'inventario_madera':
        return <InventarioMaderaView />;
      case 'insumos_clavado':
        return <InsumosClavadoView />;
      case 'lotes':
        return <GanttProduccion />;
      case 'fitosanitario':
        return <FitosanitarioView />;
      case 'certificados':
        return <CertificadosView />;
      case 'logistica':
      case 'logistica_aprobaciones':
        return <LogisticaDespachoView />;
      case 'logistica_embarques':
        return <LogisticaEmbarquesView />;
      case 'clientes':
        return <ClientesView />;
      case 'usuarios':
        return <GestionUsuariosView />;
      case 'fichas':
        return <FichasNormativasView />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      activeView={activeView}
      onNavigate={(view) => setActiveView(view)}
      onLogout={logout}
      userName={user.nombre}
    >
      <ErrorBoundary key={`/${activeView}`} label={activeView}>
        {renderView()}
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary label="Aplicación">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
