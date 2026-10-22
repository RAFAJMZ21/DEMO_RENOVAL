import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface BaseDashboardFallbackProps {
  label?: string;
  error?: Error | null;
  onRetry: () => void;
}

const tarjetaBase =
  'p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]';

export const BaseDashboardFallback: React.FC<BaseDashboardFallbackProps> = ({ error, onRetry }) => (
  <div className="space-y-6 text-white">
    <div className="bg-[#10141d] p-6 rounded-2xl border border-amber-700/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="font-bold text-amber-300">Se detectó un error al leer los datos de esta vista.</p>
          <p className="text-xs text-gray-400 break-all">
            {error?.message ? error.message : 'Error inesperado en el componente.'}
          </p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 text-emerald-950 text-xs font-bold hover:bg-lime-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className={tarjetaBase}>
        <span className="text-xs font-bold text-gray-400 tracking-wider">TARIMAS PRODUCIDAS (MES)</span>
        <div className="text-4xl font-black text-emerald-400 mt-2">—</div>
        <div className="text-xs text-gray-400 mt-2">Datos no disponibles</div>
      </div>
      <div className={tarjetaBase}>
        <span className="text-xs font-bold text-gray-400 tracking-wider">MARGEN UTILIDAD PROMEDIO</span>
        <div className="text-4xl font-black text-lime-400 mt-2">—</div>
        <div className="text-xs text-gray-400 mt-2">Datos no disponibles</div>
      </div>
      <div className={tarjetaBase}>
        <span className="text-xs font-bold text-amber-400 tracking-wider">MODELOS MÁS COTIZADOS</span>
        <div className="space-y-3 text-sm mt-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex justify-between border-b border-gray-800 pb-2 last:border-0">
              <span className="text-gray-500">—</span>
              <span className="font-bold text-gray-600">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
      <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">ESTATUS DE TRATAMIENTO FITOSANITARIO (NOM-144)</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-[#181d29] border-[#252c3d]">
          <div className="text-xs text-gray-400">ESTUFADO HT EN PROCESO</div>
          <div className="text-xl font-bold mt-1 text-amber-400">—</div>
        </div>
        <div className="p-4 rounded-xl border bg-[#181d29] border-[#252c3d]">
          <div className="text-xs text-gray-400">CERTIFICADOS LIBERADOS</div>
          <div className="text-xl font-bold mt-1 text-emerald-400">—</div>
        </div>
        <div className="p-4 rounded-xl border bg-[#181d29] border-[#252c3d]">
          <div className="text-xs text-gray-400">SELLOS HT DISPONIBLES</div>
          <div className="text-xl font-bold mt-1">Conforme a norma</div>
        </div>
      </div>
    </div>
  </div>
);

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.label ? ` - ${this.props.label}` : ''}]`, error, info);
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <BaseDashboardFallback label={this.props.label} error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
