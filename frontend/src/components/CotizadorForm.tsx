import React, { useState } from 'react';
import type { ElementoMadera, CotizacionPayload } from '../types';
import { Plus, Trash2, Calculator } from 'lucide-react';

export const CotizadorForm: React.FC<{ onSubmit: (data: CotizacionPayload) => void }> = ({ onSubmit }) => {
  const [atencion, setAtencion] = useState<string>('Jorge');
  const [nombreProducto, setNombreProducto] = useState<string>('Tarima de barrote con saque 40" x 48"');
  const [cantidad, setCantidad] = useState<number>(800);
  const [precioSugerido, setPrecioSugerido] = useState<number>(380);

  const [estufaHt, setEstufaHt] = useState<number>(0);
  const [saque, setSaque] = useState<number>(5);
  const [cepillado, setCepillado] = useState<number>(5);
  const [transporte, setTransporte] = useState<number>(15);

  const [elementos, setElementos] = useState<ElementoMadera[]>([
    { nombre_elemento: 'Tabla superior', ancho_in: 3.5, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 5, precio_pie_tabla: 14 },
    { nombre_elemento: 'Tabla Inferior', ancho_in: 4.0, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 4, precio_pie_tabla: 14 },
    { nombre_elemento: 'Barrote', ancho_in: 3.5, grueso_in: 1.50, largo_in: 48, piezas_por_tarima: 4, precio_pie_tabla: 14 },
  ]);

  const handleAddElemento = (): void => {
    setElementos([
      ...elementos,
      { nombre_elemento: 'Tabla medida', ancho_in: 5.0, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 2, precio_pie_tabla: 14 }
    ]);
  };

  const handleRemoveElemento = (index: number): void => {
    setElementos(elementos.filter((_, i) => i !== index));
  };

  const handleChangeElemento = (index: number, field: keyof ElementoMadera, value: string | number): void => {
    const updated = [...elementos];
    updated[index] = { ...updated[index], [field]: value };
    setElementos(updated);
  };

  const calcularPieTablar = (el: ElementoMadera): number => 
    Number(((el.ancho_in * el.grueso_in * el.largo_in) / 144).toFixed(3));

  const calcularCostoElemento = (el: ElementoMadera): number => 
    Number((calcularPieTablar(el) * el.precio_pie_tabla * el.piezas_por_tarima).toFixed(2));

  const costoMaderaTotal = elementos.reduce((acc, el) => acc + calcularCostoElemento(el), 0);
  const costoIndirectoTotal = Number(estufaHt) + Number(saque) + Number(cepillado) + Number(transporte);
  const costoUnitarioTotal = Number((costoMaderaTotal + costoIndirectoTotal).toFixed(2));
  const utilidadUnitaria = Number((precioSugerido - costoUnitarioTotal).toFixed(2));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({
      cliente_id: 1,
      atencion,
      nombre_producto: nombreProducto,
      cantidad_piezas: cantidad,
      precio_sugerido_unidad: precioSugerido,
      costo_estufa_ht: estufaHt,
      costo_saque: saque,
      costo_cepillado: cepillado,
      costo_transporte: transporte,
      elementos
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] text-white">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
        <Calculator className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold">Cotizador Paramétrico RENOVAL SYS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400">Atención a:</label>
          <input type="text" value={atencion} onChange={(e) => setAtencion(e.target.value)} className="w-full mt-1 p-2 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Producto / Modelo:</label>
          <input type="text" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className="w-full mt-1 p-2 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Cantidad (Piezas):</label>
          <input type="number" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full mt-1 p-2 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm" required />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-2 text-emerald-400">Desglose de Componentes de Madera</h3>
        <table className="w-full text-sm border-collapse border border-gray-800">
          <thead className="bg-[#181d29] text-gray-300">
            <tr>
              <th className="p-2 border border-gray-800">Elemento</th>
              <th className="p-2 border border-gray-800">Ancho (in)</th>
              <th className="p-2 border border-gray-800">Grueso (in)</th>
              <th className="p-2 border border-gray-800">Largo (in)</th>
              <th className="p-2 border border-gray-800">Pzs / Tarima</th>
              <th className="p-2 border border-gray-800">$/Pie Tabla</th>
              <th className="p-2 border border-gray-800">Pie Cúbico</th>
              <th className="p-2 border border-gray-800">Costo Total</th>
              <th className="p-2 border border-gray-800">Acción</th>
            </tr>
          </thead>
          <tbody>
            {elementos.map((el, index) => (
              <tr key={index} className="text-center border-b border-gray-800">
                <td className="p-2 border border-gray-800"><input type="text" value={el.nombre_elemento} onChange={(e) => handleChangeElemento(index, 'nombre_elemento', e.target.value)} className="w-full p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800"><input type="number" step="0.1" value={el.ancho_in} onChange={(e) => handleChangeElemento(index, 'ancho_in', Number(e.target.value))} className="w-20 p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800"><input type="number" step="0.01" value={el.grueso_in} onChange={(e) => handleChangeElemento(index, 'grueso_in', Number(e.target.value))} className="w-20 p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800"><input type="number" value={el.largo_in} onChange={(e) => handleChangeElemento(index, 'largo_in', Number(e.target.value))} className="w-20 p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800"><input type="number" value={el.piezas_por_tarima} onChange={(e) => handleChangeElemento(index, 'piezas_por_tarima', Number(e.target.value))} className="w-16 p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800"><input type="number" value={el.precio_pie_tabla} onChange={(e) => handleChangeElemento(index, 'precio_pie_tabla', Number(e.target.value))} className="w-20 p-1 bg-[#0a0d14] border border-gray-700 rounded text-center" /></td>
                <td className="p-2 border border-gray-800 font-mono">{calcularPieTablar(el)}</td>
                <td className="p-2 border border-gray-800 font-bold text-emerald-400">${calcularCostoElemento(el)}</td>
                <td className="p-2 border border-gray-800">
                  <button type="button" onClick={() => handleRemoveElemento(index)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={handleAddElemento} className="mt-3 flex items-center gap-1 text-xs bg-[#181d29] border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800">
          <Plus className="w-4 h-4 text-emerald-400" /> Agregar Componente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
        <div>
          <h4 className="text-xs font-bold text-gray-400 mb-2">Servicios y Costos Adicionales ($)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><label>Tratamiento HT (Estufa):</label> <input type="number" value={estufaHt} onChange={(e) => setEstufaHt(Number(e.target.value))} className="w-full p-1.5 bg-[#0a0d14] border border-gray-700 rounded mt-1" /></div>
            <div><label>Saque de Barrote:</label> <input type="number" value={saque} onChange={(e) => setSaque(Number(e.target.value))} className="w-full p-1.5 bg-[#0a0d14] border border-gray-700 rounded mt-1" /></div>
            <div><label>Cepillado:</label> <input type="number" value={cepillado} onChange={(e) => setCepillado(Number(e.target.value))} className="w-full p-1.5 bg-[#0a0d14] border border-gray-700 rounded mt-1" /></div>
            <div><label>Transporte:</label> <input type="number" value={transporte} onChange={(e) => setTransporte(Number(e.target.value))} className="w-full p-1.5 bg-[#0a0d14] border border-gray-700 rounded mt-1" /></div>
          </div>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-800/50 text-white p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Costo Madera:</span><span>${costoMaderaTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs mb-1"><span>Costo Unitario Total:</span><span>${costoUnitarioTotal}</span></div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span>Precio Sugerido Venta:</span>
              <input type="number" value={precioSugerido} onChange={(e) => setPrecioSugerido(Number(e.target.value))} className="w-24 p-1 text-black font-bold text-right rounded" />
            </div>
          </div>
          <div className="border-t border-emerald-800 pt-2 mt-2 flex justify-between items-center">
            <span className="font-bold text-sm">Utilidad Unitaria:</span>
            <span className={`text-lg font-extrabold ${utilidadUnitaria >= 0 ? 'text-lime-400' : 'text-red-400'}`}>${utilidadUnitaria}</span>
          </div>
        </div>
      </div>

      <button type="submit" className="mt-6 w-full bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold py-3 rounded-xl transition duration-200">
        Calcular y Guardar Cotización
      </button>
    </form>
  );
};