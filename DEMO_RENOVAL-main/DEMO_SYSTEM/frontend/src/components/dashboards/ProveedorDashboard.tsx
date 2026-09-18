import React from 'react';
import { 
  Truck, ShieldCheck, Package, DollarSign,
  FileText, CheckCircle
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

interface ProveedorDashboardProps {
  userName: string;
}

const misEntregas = [
  { oc: "OC-2026-089", producto: "Madera Pino Verde Troza", cantidad: "150 m³", fechaEntrega: "2026-09-20", estado: "pendiente" as const },
  { oc: "OC-2026-087", producto: "Clavo Espiral 2.5\" Rollo", cantidad: "500 kg", fechaEntrega: "2026-09-18", estado: "entregado" as const },
  { oc: "OC-2026-085", producto: "Grapas 1\" Caja", cantidad: "200 kg", fechaEntrega: "2026-09-15", estado: "facturado" as const },
];

const pendientesFacturar = [
  { oc: "OC-2026-089", producto: "Madera Pino Verde Troza", monto: 450000, fechaEntrega: "2026-09-20" },
  { oc: "OC-2026-088", producto: "Madura Pino Estufada HT", monto: 380000, fechaEntrega: "2026-09-19" },
];

export const ProveedorDashboard: React.FC<ProveedorDashboardProps> = ({ userName }) => (
  <>
    <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-violet-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-purple-950/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
          <p className="text-purple-100 text-sm">Aserraderos del Valle • Portal Proveedor</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="ÓRDENES PENDIENTES"
        value="1"
        subtitle="150 m³ madera pino verde"
        icon={<Package className="w-4 h-4" />}
        color="text-amber-400"
        trend="Entrega: 20 sep"
        trendColor="text-amber-400"
      />
      <DashboardCard
        title="ENTREGADAS ESTE MES"
        value="3"
        subtitle="OC-087, OC-086, OC-085"
        icon={<CheckCircle className="w-4 h-4" />}
        color="text-emerald-400"
      />
      <DashboardCard
        title="PENDIENTES FACTURAR"
        value="$830,000"
        subtitle="2 órdenes entregadas"
        icon={<DollarSign className="w-4 h-4" />}
        color="text-blue-400"
        trend="Facturar antes 30 sep"
      />
      <DashboardCard
        title="CERTIFICADOS HT"
        value="2 vigentes"
        subtitle="Sellos MX-144-HT-089"
        icon={<ShieldCheck className="w-4 h-4" />}
        color="text-emerald-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400" />
          MIS ÓRDENES DE COMPRA ASIGNADAS
        </h4>
        <div className="space-y-3">
          {misEntregas.map((oc, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
              oc.estado === 'pendiente' ? 'bg-amber-500/10 border-amber-500/30' :
              oc.estado === 'entregado' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white truncate">{oc.oc}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    oc.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-400' :
                    oc.estado === 'entregado' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {oc.estado === 'pendiente' ? 'PENDIENTE ENTREGA' : oc.estado === 'entregado' ? 'ENTREGADO' : 'FACTURADO'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{oc.producto} • {oc.cantidad} • Entrega: {oc.fechaEntrega}</div>
              </div>
              {oc.estado === 'pendiente' && (
                <button className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-500/30 transition border border-amber-500/30">
                  Confirmar Entrega
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-400" />
          PENDIENTES DE FACTURAR
        </h4>
        <div className="space-y-3">
          {pendientesFacturar.map((pf, idx) => (
            <div key={idx} className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{pf.oc}</div>
                <div className="text-xs text-gray-400">{pf.producto} • Entregado: {pf.fechaEntrega}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">${pf.monto.toLocaleString()}</div>
                <button className="text-xs text-blue-400 hover:text-blue-300 underline mt-1">Generar Factura</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          PRÓXIMAS ENTREGAS
        </h4>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="font-bold text-amber-300">OC-2026-089</div>
            <div className="text-xs text-gray-400">Madera Pino Verde • 150 m³</div>
            <div className="text-xs text-amber-400">Entrega: 20 sep (2 días)</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="font-bold text-blue-300">OC-2026-088</div>
            <div className="text-xs text-gray-400">Madera Estufada HT • 80 m³</div>
            <div className="text-xs text-blue-400">Entrega: 19 sep (mañana)</div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          CERTIFICADOS HT VIGENTES
        </h4>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between">
            <span className="text-gray-300">Sello: MX-144-HT-089</span>
            <span className="text-emerald-400 font-bold text-xs">VIGENTE</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between">
            <span className="text-gray-300">Sello: MX-144-HT-090</span>
            <span className="text-emerald-400 font-bold text-xs">VIGENTE</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between">
            <span className="text-gray-300">Sello: MX-144-HT-088</span>
            <span className="text-amber-400 font-bold text-xs">POR VENCER (15 días)</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          DOCUMENTOS REQUERIDOS
        </h4>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-amber-300">Remisión OC-089</div>
              <div className="text-xs text-gray-400">Requerida al entregar</div>
            </div>
            <button className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded hover:bg-amber-500/30">Subir</button>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-blue-300">Factura OC-087</div>
              <div className="text-xs text-gray-400">Pendiente timbrado SAT</div>
            </div>
            <button className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30">Generar</button>
          </div>
        </div>
      </div>
    </div>
  </>
);