import React from 'react';
import { 
  Calculator, Truck, ShieldCheck, CreditCard, 
  DollarSign
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

interface ClienteDashboardProps {
  userName: string;
}

const misCotizaciones = [
  { folio: "COT-20260918143022", producto: "Tarima Barrote 40\" x 48\"", piezas: 500, precio: 285.50, estado: "aprobada" as const, fecha: "2026-09-18" },
  { folio: "COT-20260917101545", producto: "Tarima Tacón Perimetral", piezas: 300, precio: 312.00, estado: "en_revision" as const, fecha: "2026-09-17" },
  { folio: "COT-20260915092211", producto: "Caja Industrial Reforzada", piezas: 150, precio: 425.00, estado: "rechazada" as const, fecha: "2026-09-15" },
];

const embarques = [
  { embarque: "EMB-2026-042", producto: "Tarima Barrote", tarimas: 45, fecha: "2026-09-18", estado: "entregado" as const },
  { embarque: "EMB-2026-044", producto: "Tarima Tacón", tarimas: 32, fecha: "2026-09-19", estado: "en_transito" as const },
];

const certificados = [
  { certificado: "CERT-HT-2026-012", lote: "LOT-2026-001", fecha: "2026-09-17", estado: "disponible" as const },
  { certificado: "CERT-HT-2026-013", lote: "LOT-2026-003", fecha: "2026-09-15", estado: "descargado" as const },
];

export const ClienteDashboard: React.FC<ClienteDashboardProps> = ({ userName }) => (
  <>
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-indigo-950/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
          <p className="text-indigo-100 text-sm">Logística & Embalajes del Valle S.A. • Portal Cliente</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="CRÉDITO DISPONIBLE"
        value="$320,000"
        subtitle="Límite: $500,000 | Utilizado: $180,000"
        icon={<CreditCard className="w-4 h-4" />}
        color="text-emerald-400"
        trend="Anticipos: $50,000"
      />
      <DashboardCard
        title="COTIZACIONES ACTIVAS"
        value="3"
        subtitle="1 aprobada, 1 en revisión, 1 rechazada"
        icon={<Calculator className="w-4 h-4" />}
        color="text-blue-400"
      />
      <DashboardCard
        title="EMBARQUES EN CURSO"
        value="1"
        subtitle="1 en tránsito, 1 entregado hoy"
        icon={<Truck className="w-4 h-4" />}
        color="text-amber-400"
        trend="EMB-044 llega mañana"
      />
      <DashboardCard
        title="CERTIFICADOS HT"
        value="2 disponibles"
        subtitle="NOM-144 vigentes"
        icon={<ShieldCheck className="w-4 h-4" />}
        color="text-emerald-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          MIS COTIZACIONES RECIENTES
        </h4>
        <div className="space-y-3">
          {misCotizaciones.map((cot, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
              cot.estado === 'aprobada' ? 'bg-emerald-500/10 border-emerald-500/30' :
              cot.estado === 'en_revision' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white truncate">{cot.folio}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    cot.estado === 'aprobada' ? 'bg-emerald-500/20 text-emerald-400' :
                    cot.estado === 'en_revision' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {cot.estado === 'aprobada' ? 'APROBADA' : cot.estado === 'en_revision' ? 'EN REVISIÓN' : 'RECHAZADA'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{cot.producto} • {cot.piezas} pzas • {cot.fecha}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">${cot.precio.toLocaleString()}</div>
                <div className="text-xs text-gray-400">por unidad</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          EMBARQUES PROGRAMADOS
        </h4>
        <div className="space-y-3">
          {embarques.map((emb, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
              emb.estado === 'entregado' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{emb.embarque}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    emb.estado === 'entregado' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {emb.estado === 'entregado' ? 'ENTREGADO' : 'EN TRÁNSITO'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{emb.producto} • {emb.tarimas} tarimas • {emb.fecha}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          CERTIFICADOS FITOSANITARIOS DISPONIBLES
        </h4>
        <div className="space-y-2">
          {certificados.map((cert, idx) => (
            <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
              cert.estado === 'disponible' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-gray-500/10 border-gray-500/30'
            }`}>
              <div>
                <div className="font-bold text-white">{cert.certificado}</div>
                <div className="text-xs text-gray-400">Lote: {cert.lote} • {cert.fecha}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                cert.estado === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {cert.estado === 'disponible' ? 'DESCARGAR' : 'DESCARGADO'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          ESTADO DE CUENTA RESUMEN
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400">Límite de Crédito</div>
              <div className="text-xl font-bold text-white">$500,000</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400">Crédito Utilizado</div>
              <div className="text-xl font-bold text-amber-400">$180,000</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400">Disponible</div>
              <div className="text-xl font-bold text-emerald-400">$320,000</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400">Anticipos</div>
              <div className="text-xl font-bold text-blue-400">$50,000</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs text-emerald-300">Saldo pendiente: $130,000</div>
            <div className="text-xs text-gray-400">(Crédito utilizado - Anticipos)</div>
          </div>
        </div>
      </div>
    </div>
  </>
);