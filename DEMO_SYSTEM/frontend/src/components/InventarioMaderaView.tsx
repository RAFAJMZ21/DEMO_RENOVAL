import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInventarioMateriaPrima, getInventarioTarimas } from '../api/inventario';
import { MOCK_MATERIA_PRIMA, MOCK_TARIMAS } from '../api/demoMocks';
import type { EstadoInventarioTarima } from '../types';
import { Boxes, Plus, AlertCircle, Warehouse, PackageCheck } from 'lucide-react';

const chipEstadoTarima = (estado: EstadoInventarioTarima): string => {
  switch (estado) {
    case 'RESERVADO':
      return 'bg-amber-950/70 text-amber-400 border border-amber-800';
    case 'EN_TRANSITO':
      return 'bg-blue-950/70 text-blue-300 border border-blue-800';
    default:
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800';
  }
};

const etiquetaEstadoTarima = (estado: EstadoInventarioTarima): string =>
  estado === 'RESERVADO' ? 'Reservado' : estado === 'EN_TRANSITO' ? 'En Tránsito' : 'Disponible';

export const InventarioMaderaView: React.FC = () => {
  // initialData: ambas consultas arrancan con datos del Modo Demo y la vista
  // nunca queda en undefined/vacía aunque la API falle o no responda.
  const { data: inventario } = useQuery({
    queryKey: ['inventario-materia-prima'],
    queryFn: getInventarioMateriaPrima,
    initialData: MOCK_MATERIA_PRIMA,
  });

  const { data: tarimasApi } = useQuery({
    queryKey: ['inventario-tarimas'],
    queryFn: getInventarioTarimas,
    initialData: MOCK_TARIMAS,
  });

  const tarimas = tarimasApi ?? MOCK_TARIMAS;
  const materiaPrima = inventario ?? MOCK_MATERIA_PRIMA;

  const disponibles = tarimas.tarimas.filter((t) => t.estado === 'DISPONIBLE').length;
  const reservados = tarimas.tarimas.filter((t) => t.estado === 'RESERVADO').length;
  const tarimasLista = tarimas.tarimas;
  const insumosLista = materiaPrima.insumos;

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" /> Inventario de Tarimas Producidas & Cubaje de Madera
          </h2>
          <p className="text-xs text-gray-400">Producto terminado en piso y materia prima. Cubaje: (Ancho x Grueso x Largo) / 144.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Registrar Entrada Madera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">PIEZAS EN PISO (PT)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {(tarimas.total_piezas ?? 0).toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-gray-400">~{(tarimas.total_pies_tablares ?? 0).toLocaleString('es-MX')} Pies Tablares</span>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">MODELOS DISPONIBLES</span>
          <div className="text-2xl font-black text-lime-400 mt-1">{disponibles}</div>
          <span className="text-[10px] text-gray-400">{reservados} modelo(s) reservado(s) a cliente</span>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">PUNTO REORDEN</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
            <span>OK</span> <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-gray-400">Abastecimiento normal</span>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-2 mb-4">
          <PackageCheck className="w-5 h-5 text-lime-400" />
          <h3 className="text-sm font-bold">
            Tarimas Producidas en Almacén
            {tarimas.area && <span className="text-gray-500 font-normal"> • {tarimas.area}</span>}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Modelo</th>
                <th className="p-3">Medidas</th>
                <th className="p-3">Madera</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Cliente Reservado</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tarimasLista.map((tarima) => (
                <tr key={tarima.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-mono text-xs text-emerald-400 font-bold">{tarima.codigo}</td>
                  <td className="p-3 font-bold">{tarima.modelo}</td>
                  <td className="p-3 text-gray-400 font-mono text-xs">{tarima.medidas}</td>
                  <td className="p-3 text-gray-300">{tarima.madera}</td>
                  <td className="p-3">
                    <div className="font-mono text-emerald-400 font-bold">{tarima.piezas_disponibles.toLocaleString('es-MX')} pzs</div>
                    {tarima.pies_tablares > 0 && (
                      <div className="text-[10px] text-gray-500">{tarima.pies_tablares.toLocaleString('es-MX')} PT</div>
                    )}
                  </td>
                  <td className="p-3 text-gray-400">{tarima.ubicacion}</td>
                  <td className="p-3 text-gray-300">{tarima.cliente_reservado}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold w-fit inline-block ${chipEstadoTarima(tarima.estado)}`}>
                      {etiquetaEstadoTarima(tarima.estado)}
                    </span>
                  </td>
                </tr>
              ))}
              {tarimasLista.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500 text-xs">
                    Sin tarimas producidas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="flex items-center gap-2 mb-4">
          <Warehouse className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold">
            Existencias de Materia Prima
            {materiaPrima.area && <span className="text-gray-500 font-normal"> • {materiaPrima.area}</span>}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                <th className="p-3">Material / Insumo</th>
                <th className="p-3">Existencia</th>
                <th className="p-3">Proveedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {insumosLista.map((insumo, idx) => (
                <tr key={`${insumo.item}-${idx}`} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-semibold">{insumo.item}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{insumo.existencia}</td>
                  <td className="p-3 text-gray-400">{insumo.proveedor}</td>
                </tr>
              ))}
              {insumosLista.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500 text-xs">
                    Sin existencias registradas en almacén.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};