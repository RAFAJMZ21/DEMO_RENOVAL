import React from 'react';
import { 
  TrendingUp, Boxes, 
  AlertTriangle, Clock, CheckCircle, Flame, ShieldCheck
} from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, value, subtitle, icon, color, trend, trendColor 
}) => (
  <div className={`p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]`}>
    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
      <span className={color}>{icon}</span>
      <span>{title}</span>
    </div>
    <div className="text-4xl font-black mt-2 text-white">
      {value}
    </div>
    {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    {trend && (
      <div className={`text-xs font-semibold mt-2 ${trendColor || 'text-emerald-400'}`}>
        {trend}
      </div>
    )}
  </div>
);

interface AdminDashboardProps {
  userName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName }) => (
  <>
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
          <p className="text-emerald-100 text-sm">Planta Lerma • Administrador del Sistema</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="TARIMAS PRODUCIDAS (MES)"
        value="12,450"
        subtitle="3 lotes completados"
        icon={<Boxes className="w-4 h-4" />}
        color="text-emerald-400"
        trend="+12% vs mes anterior"
      />
      <DashboardCard
        title="MARGEN UTILIDAD PROMEDIO"
        value="28.4%"
        subtitle="+$48.50 MXN por unidad"
        icon={<TrendingUp className="w-4 h-4" />}
        color="text-lime-400"
        trend="+2.1% vs objetivo"
      />
      <DashboardCard
        title="HT EN PROCESO"
        value="3 Lotes"
        subtitle="2,400 piezas en estufado"
        icon={<Flame className="w-4 h-4" />}
        color="text-amber-400"
        trend="2 vencen hoy"
        trendColor="text-red-400"
      />
      <DashboardCard
        title="CERTIFICADOS LIBERADOS"
        value="15"
        subtitle="Conformes NOM-144"
        icon={<ShieldCheck className="w-4 h-4" />}
        color="text-emerald-400"
        trend="3 pendientes firma"
        trendColor="text-amber-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-lime-400" />
          MODELOS MÁS PRODUCIDOS
        </h4>
        <div className="space-y-3 text-sm">
          {[
            { nombre: "Tarima Barrote 40\" x 48\"", unidades: 4800, utilidad: 32.1 },
            { nombre: "Tarima Tacón Perimetral", unidades: 3200, utilidad: 24.8 },
            { nombre: "Caja de Madera Industrial", unidades: 1450, utilidad: 18.5 },
          ].map((model, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0">
              <div>
                <span className="text-gray-300">{model.nombre}</span>
                <div className="text-xs text-gray-500">Utilidad: {model.utilidad}%</div>
              </div>
              <span className="font-bold text-emerald-400">{model.unidades.toLocaleString()} u</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          ALERTAS CRÍTICAS
        </h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="font-bold text-red-300">Stock crítico: Clavos 3\"</div>
              <div className="text-xs text-gray-400">250 kg (mín: 500 kg)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-amber-300">2 lotes HT vencen hoy</div>
              <div className="text-xs text-gray-400">LOT-2026-001, LOT-2026-002</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold text-emerald-300">Cartera al día</div>
              <div className="text-xs text-gray-400">Cobranza 94% efectiva</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);