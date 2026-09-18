import React from 'react';
import { 
  Trees, Package, Truck, ShieldCheck, 
  AlertTriangle
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

interface AlmacenistaDashboardProps {
  userName: string;
}

const stockData = [
  { item: "Madera Pino Verde (Troza/Tabla)", existencia: "450 m³", proveedor: "Aserraderos del Valle", estado: "normal" as const },
  { item: "Madera Pino Estufada HT", existencia: "125 m³", proveedor: "Interno (Horno HT-01)", estado: "reservado" as const },
  { item: "Clavo Espiral en Rollo 2 1/2\"", existencia: "1,200 kg", proveedor: "Sistemas de Sujeción Industrial", estado: "normal" as const },
  { item: "Clavo Estándar 3\"", existencia: "250 kg", proveedor: "Sistemas de Sujeción Industrial", estado: "critico" as const },
  { item: "Grapas de Sujeción 1\"", existencia: "400 kg", proveedor: "Fijaciones Lerma", estado: "normal" as const },
];

const salidasHoy = [
  { embarque: "EMB-2026-045", cliente: "Logística Valle", tarimas: 45, chofer: "Roberto M.", estado: "cargando" as const },
  { embarque: "EMB-2026-046", cliente: "Automotive Freight", tarimas: 32, chofer: "Carlos R.", estado: "programado" as const },
  { embarque: "EMB-2026-047", cliente: "Maderas del Norte", tarimas: 28, chofer: "Miguel T.", estado: "en_transito" as const },
];

export const AlmacenistaDashboard: React.FC<AlmacenistaDashboardProps> = ({ userName }) => (
  <>
    <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-amber-950/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-black">Bienvenido, {userName}.</h3>
          <p className="text-amber-100 text-sm">Planta Lerma • Almacenista Principal</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="STOCK MADERA VERDE"
        value="450 m³"
        subtitle="~190,800 PT disponibles"
        icon={<Trees className="w-4 h-4" />}
        color="text-emerald-400"
        trend="Ingreso: +50 m³ ayer"
      />
      <DashboardCard
        title="MADERA ESTUFADA HT"
        value="125 m³"
        subtitle="80 m³ reservados producción"
        icon={<Package className="w-4 h-4" />}
        color="text-blue-400"
        trend="Disponible: 45 m³"
        trendColor="text-amber-400"
      />
      <DashboardCard
        title="EMBARQUES HOY"
        value="3"
        subtitle="105 tarimas programadas"
        icon={<Truck className="w-4 h-4" />}
        color="text-amber-400"
        trend="1 cargando, 2 programados"
      />
      <DashboardCard
        title="ALERTAS STOCK"
        value="1 CRÍTICA"
        subtitle={'Clavos 3" bajo mínimo'}
        icon={<AlertTriangle className="w-4 h-4" />}
        color="text-red-400"
        trend="Requiere pedido urgente"
        trendColor="text-red-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Trees className="w-4 h-4 text-emerald-400" />
          INVENTARIO MADERA & INSUMOS
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stockData.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
              item.estado === 'critico' ? 'bg-red-500/10 border-red-500/30' : 
              item.estado === 'reservado' ? 'bg-blue-500/10 border-blue-500/30' : 
              'bg-[#181d29] border-gray-800'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white truncate">{item.item}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.estado === 'critico' ? 'bg-red-500/20 text-red-400' :
                    item.estado === 'reservado' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.estado === 'critico' ? 'CRÍTICO' : item.estado === 'reservado' ? 'RESERVADO' : 'NORMAL'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Proveedor: {item.proveedor}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{item.existencia}</div>
                <div className="text-xs text-gray-400">En existencia</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          SALIDAS & EMBARQUES DEL DÍA
        </h4>
        <div className="space-y-3">
          {salidasHoy.map((salida, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
              salida.estado === 'cargando' ? 'bg-amber-500/10 border-amber-500/30' :
              salida.estado === 'en_transito' ? 'bg-blue-500/10 border-blue-500/30' :
              'bg-[#181d29] border-gray-800'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{salida.embarque}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    salida.estado === 'cargando' ? 'bg-amber-500/20 text-amber-400' :
                    salida.estado === 'en_transito' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {salida.estado === 'cargando' ? 'CARGANDO' : salida.estado === 'en_transito' ? 'EN TRÁNSITO' : 'PROGRAMADO'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{salida.cliente} • Chofer: {salida.chofer}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{salida.tarimas}</div>
                <div className="text-xs text-gray-400">tarimas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          CERTIFICADOS HT LISTOS
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-gray-300">CERT-HT-2026-015</span>
            <span className="text-emerald-400 font-bold">LISTO</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-gray-300">CERT-HT-2026-016</span>
            <span className="text-emerald-400 font-bold">LISTO</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-gray-300">CERT-HT-2026-017</span>
            <span className="text-amber-400 font-bold">PENDIENTE</span>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-400" />
          ENTRADAS ESPERADAS
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-gray-300">Madera Pino Verde</span>
            <span className="text-blue-400 font-bold">50 m³ (mañana)</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-gray-300">Clavos Espiral 2.5\"</span>
            <span className="text-blue-400 font-bold">500 kg (mañana)</span>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-2xl border bg-[#10141d] border-[#1e2430]">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          PEDIDOS URGENTES
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-gray-300">Clavo Estándar 3\"</span>
            <span className="text-red-400 font-bold">PEDIR 500 kg</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-gray-300">Grapas 1\"</span>
            <span className="text-amber-400 font-bold">Stock: 400 kg</span>
          </div>
        </div>
      </div>
    </div>
  </>
);