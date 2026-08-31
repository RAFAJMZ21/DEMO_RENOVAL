import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './components/DashboardLayout';
import { CotizadorForm } from './components/CotizadorForm';
import { GanttProduccion } from './components/GanttProduccion';
import { LoginForm } from './components/LoginForm';
import { calcularCotizacion } from './api/cotizaciones';
import type { CotizacionPayload, TokenResponse } from './types';

const queryClient = new QueryClient();

export const AppContent: React.FC = () => {
  const [user, setUser] = useState<TokenResponse | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

  if (!user) {
    return <LoginForm onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleSaveCotizacion = async (payload: CotizacionPayload) => {
    try {
      const res = await calcularCotizacion(payload);
      alert(`Cotización calculada exitosamente. Folio: ${res.folio} - Utilidad: $${res.utilidad_unitaria}`);
    } catch {
      alert('Error al procesar la cotización.');
    }
  };

  return (
    <div className="relative">
      {activeView === 'dashboard' && <DashboardLayout onNavigate={(view) => setActiveView(view)} />}
      
      <div className="p-6 bg-[#0a0d14] min-h-screen text-white">
        {activeView === 'cotizador' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <button onClick={() => setActiveView('dashboard')} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg">← Volver al Dashboard</button>
            <CotizadorForm onSubmit={handleSaveCotizacion} />
          </div>
        )}

        {activeView === 'lotes' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <button onClick={() => setActiveView('dashboard')} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg mb-4">← Volver al Dashboard</button>
            <GanttProduccion />
          </div>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;