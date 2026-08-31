import React from 'react';
import { Users, DollarSign, CreditCard } from 'lucide-react';

export const ClientesView: React.FC = () => {
  const clientes = [
    { id: 1, razon_social: 'Logística & Embalajes del Valle S.A.', rfc: 'LEV180420ABC', limite: 500000, utilizado: 180000, anticipo: 50000 },
    { id: 2, razon_social: 'Automotive Freight Mexico S.A. de C.V.', rfc: 'AFM990115XYZ', limite: 750000, utilizado: 320000, anticipo: 100000 },
    { id: 3, razon_social: 'Empaques Industriales Lerma', rfc: 'EIL050812PQR', limite: 300000, utilizado: 45000, anticipo: 0 },
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold">Catálogo de Clientes & Cuentas por Cobrar</h2>
            <p className="text-xs text-gray-400">Líneas de crédito autorizadas, anticipos y saldos corrientes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {clientes.map((c) => (
            <div key={c.id} className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d] space-y-2">
              <div className="font-bold text-white text-sm">{c.razon_social}</div>
              <div className="text-[11px] text-gray-400 font-mono">RFC: {c.rfc}</div>
              <div className="border-t border-gray-800 pt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Límite Crédito:</span>
                  <span className="font-bold">${c.limite.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> Utilizado:</span>
                  <span className="font-bold text-amber-400">${c.utilizado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Disponible:</span>
                  <span className="font-bold text-emerald-400">${(c.limite - c.utilizado).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};