import React from 'react';
import { 
  PackageCheck, GanttChart, Flame, ShieldCheck, 
  Trees, Package, Clock, AlertTriangle, TrendingUp
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

interface OperadorDashboardProps {
  userName: string;
}

export const OperadorDashboard: React.FC<OperadorDashboardProps> = ({ userName }) => (
  <>
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-blue-950/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
          <p className="text-blue-100 text-sm">Planta Lerma • Operador de Producción</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="LOTES ACTIVOS HOY"
        value="3"
        subtitle="1 en Aserradero, 1 en Armado, 1 en HT"
        icon={<PackageCheck className="w-4 h-4" />}
        color="text-blue-400"
      />
      <DashboardCard
        title="PIEZAS EN PROCESO"
        value="2,470"
        subtitle="850 + 320 + 1,300 pendientes"
        icon={<Package className="w-4 h-4" />}
        color="text-cyan-400"
      />
      <DashboardCard
        title="HT EN ESTUFADO"
        value="1 Lote"
        subtitle="LOT-2026-001 • 58.4°C • 42 min"
        icon={<Flame className="w-4 h-4" />}
        color="text-amber-400"
        trend="Vence en 4 hrs"
        trendColor="text-red-400"
      />
      <DashboardCard
        title="AVANCE PROMEDIO"
        value="67%"
        subtitle="Meta: 85% al cierre turno"
        icon={<TrendingUp className="w-4 h-4" />}
        color="text-emerald-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <GanttChart className="w-4 h-4 text-blue-400" />
          PRODUCCIÓN DEL DÍA (GANTT)
        </h4>
        <div className="space-y-3">
          {[
            { folio: "LOT-2026-001", producto: "Tarima Barrote 40\" x 48\"", etapa: "HT_FITOSANITARIO", progreso: 71, area: "Horno HT-01", estado: "en_proceso" },
            { folio: "LOT-2026-002", producto: "Tarima Tacón Perimetral", etapa: "ARMADO", progreso: 40, area: "Línea Clavado B", estado: "en_proceso" },
            { folio: "LOT-2026-003", producto: "Caja Industrial", etapa: "EMBARQUE", progreso: 100, area: "Almacén PT", estado: "completado" },
          ].map((lote, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-gray-800 bg-[#181d29]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-white">{lote.folio}</div>
                  <div className="text-xs text-gray-400">{lote.producto}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  lote.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {lote.etapa}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    lote.estado === 'completado' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${lote.progreso}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{lote.progreso}% completado</span>
                <span>{lote.area}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          ACCIONES REQUERIDAS
        </h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-amber-300">Verificar temperatura HT</div>
              <div className="text-xs text-gray-400">LOT-2026-001: 58.4°C (mín 56°C)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-amber-300">Completar armado LOT-002</div>
              <div className="text-xs text-gray-400">Faltan 480 piezas (40% avance)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
            <Trees className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-bold text-blue-300">Solicitar madera estufada</div>
              <div className="text-xs text-gray-400">Stock: 125 m³ (reserva 80 m³)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
      <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        CERTIFICADOS HT PENDIENTES
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-[#181d29]">
          <div className="text-xs text-gray-400">LIBERADOS HOY</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">3</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#181d29]">
          <div className="text-xs text-gray-400">PENDIENTES FIRMA</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">2</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#181d29]">
          <div className="text-xs text-gray-400">EN PROCESO ESTUFADO</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">1</div>
        </div>
      </div>
    </div>
  </>
);