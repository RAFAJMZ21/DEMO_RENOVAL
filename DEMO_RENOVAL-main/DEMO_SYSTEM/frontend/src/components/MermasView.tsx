import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trash2, Plus, Loader2, AlertTriangle, Calculator } from 'lucide-react';
import { getControlMermas, createMerma, deleteMerma, getProduccionGantt } from '../api/modulos';
import type { MermaCreate } from '../types';

interface ControlMermaData {
  id: number;
  folio_lote: string;
  pt_teoricos: number;
  pt_reales_utilizados: number;
  pt_desperdicio: number;
  porcentaje_scrap: number;
  causa_principal: string;
}

interface LoteGantt {
  id: number;
  folio_lote: string;
  producto: string;
}

export const MermasView: React.FC = () => {
  const { data: mermas, isLoading, refetch } = useQuery<ControlMermaData[]>({
    queryKey: ['mermas-scrap'],
    queryFn: getControlMermas,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: lotes } = useQuery<LoteGantt[]>({
    queryKey: ['produccion-gantt'],
    queryFn: getProduccionGantt,
    staleTime: 30000,
  });

  const [showModal, setShowModal] = React.useState(false);
  const [formData, setFormData] = React.useState<MermaCreate>({
    folio_lote: '',
    pt_teoricos: 0,
    pt_reales_utilizados: 0,
    pt_desperdicio: 0,
    porcentaje_scrap: 0,
    causa_principal: '',
  });

  const createMutation = useMutation({
    mutationFn: createMerma,
    onSuccess: () => {
      setShowModal(false);
      setFormData({ folio_lote: '', pt_teoricos: 0, pt_reales_utilizados: 0, pt_desperdicio: 0, porcentaje_scrap: 0, causa_principal: '' });
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMerma,
    onSuccess: () => refetch(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.folio_lote || formData.pt_teoricos <= 0 || formData.pt_reales_utilizados < 0) {
      alert('Complete todos los campos requeridos');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este registro de merma?')) {
      deleteMutation.mutate(id);
    }
  };

  const calculateScrap = () => {
    if (formData.pt_teoricos > 0 && formData.pt_reales_utilizados >= 0) {
      const desperdicio = formData.pt_teoricos - formData.pt_reales_utilizados;
      const porcentaje = formData.pt_teoricos > 0 ? (desperdicio / formData.pt_teoricos) * 100 : 0;
      setFormData(prev => ({
        ...prev,
        pt_desperdicio: Math.max(0, desperdicio),
        porcentaje_scrap: Math.round(porcentaje * 100) / 100,
      }));
    }
  };

  const totalMerma = mermas?.reduce((sum: number, m: ControlMermaData) => sum + m.pt_desperdicio, 0) || 0;
  const avgScrap = mermas?.length ? mermas.reduce((sum: number, m: ControlMermaData) => sum + m.porcentaje_scrap, 0) / mermas.length : 0;

  if (isLoading && !mermas) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando control de mermas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/80 border border-red-800/60 rounded-xl text-red-400">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" /> Control de Mermas & Scrap
            </h2>
            <p className="text-xs text-gray-400">Registro de desperdicio de madera (Pies Tablares) por lote de producción.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setFormData({ folio_lote: '', pt_teoricos: 0, pt_reales_utilizados: 0, pt_desperdicio: 0, porcentaje_scrap: 0, causa_principal: '' }); setShowModal(true); }} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
            <Plus className="w-4 h-4" /> Registrar Merma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">TOTAL MERMA (PT)</span>
          <div className="text-2xl font-black text-red-400 mt-1">{totalMerma.toLocaleString()} PT</div>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">PROMEDIO SCRAP %</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{avgScrap.toFixed(1)}%</div>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">REGISTROS</span>
          <div className="text-2xl font-black text-white mt-1">{mermas?.length ?? 0}</div>
        </div>
        <div className="bg-[#181d29] p-4 rounded-xl border border-[#252c3d]">
          <span className="text-xs text-gray-400">LOTES AFECTADOS</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {new Set(mermas?.map((m: ControlMermaData) => m.folio_lote) || []).size}
          </div>
        </div>
      </div>

      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181d29] text-gray-400 text-xs">
              <tr>
                <th className="p-3">Folio Lote</th>
                <th className="p-3">PT Teóricos</th>
                <th className="p-3">PT Reales</th>
                <th className="p-3">Desperdicio (PT)</th>
                <th className="p-3">Scrap %</th>
                <th className="p-3">Causa Principal</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {mermas?.map((m: ControlMermaData) => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{m.folio_lote}</td>
                  <td className="p-3 font-mono">{m.pt_teoricos.toLocaleString()}</td>
                  <td className="p-3 font-mono">{m.pt_reales_utilizados.toLocaleString()}</td>
                  <td className="p-3 font-mono text-red-400">{m.pt_desperdicio.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      m.porcentaje_scrap > 5 ? 'bg-red-500/20 text-red-400' :
                      m.porcentaje_scrap > 2 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {m.porcentaje_scrap.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-gray-300">{m.causa_principal}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending} className="text-red-400 hover:text-red-300 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!mermas || mermas.length === 0) && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">No hay registros de mermas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Merma */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#10141d] border border-[#1e2430] w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Registrar Merma / Scrap</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400">Folio Lote *</label>
                <select value={formData.folio_lote} onChange={(e) => setFormData({...formData, folio_lote: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required>
                  <option value="">-- Seleccionar Lote --</option>
                  {lotes?.map((l: { id: number; folio_lote: string; producto: string }) => (
                    <option key={l.id} value={l.folio_lote}>{l.folio_lote} - {l.producto}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400">PT Teóricos *</label>
                  <input type="number" step="0.01" value={formData.pt_teoricos} onChange={(e) => { setFormData({...formData, pt_teoricos: Number(e.target.value)}); calculateScrap(); }} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">PT Reales Utilizados *</label>
                  <input type="number" step="0.01" value={formData.pt_reales_utilizados} onChange={(e) => { setFormData({...formData, pt_reales_utilizados: Number(e.target.value)}); calculateScrap(); }} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400">Desperdicio (PT)</label>
                  <input type="number" step="0.01" value={formData.pt_desperdicio} onChange={(e) => setFormData({...formData, pt_desperdicio: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Scrap %</label>
                  <input type="number" step="0.01" value={formData.porcentaje_scrap} onChange={(e) => setFormData({...formData, porcentaje_scrap: Number(e.target.value)})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-mono outline-none focus:border-emerald-500" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400">Causa Principal</label>
                <textarea value={formData.causa_principal} onChange={(e) => setFormData({...formData, causa_principal: e.target.value})} rows={3} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" placeholder="Ej: Corte incorrecto, defectos madera, error medida..." />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300 disabled:opacity-50">
                  {createMutation.isPending ? 'Guardando...' : 'Registrar Merma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};