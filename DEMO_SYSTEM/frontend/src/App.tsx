import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext.tsx';
import { AuthProvider } from './context/AuthProvider';
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
import { CotizacionesView } from './views/CotizacionesView';
import { LogisticaOperadorView } from './views/LogisticaOperadorView';
import { LogisticaAdminView } from './views/LogisticaAdminView';
import { PanelOperadorView } from './views/PanelOperadorView';
import { calcularCotizacion } from './api/cotizaciones';
import type { CotizacionPayload } from './types';

const queryClient = new QueryClient();

const VISTA_POR_ROL: Record<string, string> = {
  ADMIN: 'dashboard',
  OPERADOR: 'logistica_operador_dashboard',
};

export const AppContent: React.FC = () => {
  const { user, rol, esOperador, login, logout } = useAuth();

  const [activeView, setActiveView] = useState<string>(() =>
    VISTA_POR_ROL[rol] ?? 'dashboard'
  );

  // Al iniciar sesión (cambio de usuario), restablece el panel por rol durante el render.
  const [sesionActivaEmail, setSesionActivaEmail] = useState<string | null>(null);
  const emailSesion = user?.user_info?.email ?? null;
  if (user && emailSesion !== sesionActivaEmail) {
    setSesionActivaEmail(emailSesion);
    setActiveView(VISTA_POR_ROL[rol] ?? 'dashboard');
  }

  if (!user) {
    return (
      <LoginForm
        onLogin={async (identificador, password) => {
          await login(identificador, password);
        }}
      />
    );
  }

  const handleLogout = () => {
    logout();
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
      onNavigate={setActiveView}
      onLogout={handleLogout}
      userName={user.user_info.nombre}
    >
      {/* Rol OPERADOR: ÚNICAMENTE módulo de transporte */}
      {esOperador ? (
        activeView === 'logistica_operador_dashboard' ? (
          <PanelOperadorView
            onNuevoViaje={() => setActiveView('logistica_operador')}
            onVerEmbarques={() => setActiveView('logistica_embarques')}
          />
        ) : activeView === 'logistica_embarques' ? (
          <LogisticaDespachoView />
        ) : (
          <LogisticaOperadorView />
        )
      ) : (
        <>
          {activeView === 'cotizador' && (
            <CotizadorForm onSubmit={handleSaveCotizacion} />
          )}

          {activeView === 'cotizaciones' && (
            <CotizacionesView />
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

          {activeView === 'logistica_operador' && (
            <LogisticaOperadorView />
          )}

          {activeView === 'logistica_embarques' && (
            <LogisticaDespachoView />
          )}

          {activeView === 'logistica_admin' && (
            <LogisticaAdminView />
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
        </>
      )}
    </DashboardLayout>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;