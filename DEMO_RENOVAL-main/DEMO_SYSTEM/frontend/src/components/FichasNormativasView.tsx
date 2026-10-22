import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, FileText, Download, Plus, Edit, Trash2, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { getFichasNormativas, createFichaNormativa, updateFichaNormativa, deleteFichaNormativa } from '../api/modulos';
import type { FichaNormativa } from '../types';
import api from '../api/axios';

export const FichasNormativasView: React.FC = () => {
  const { data: fichas, isLoading, refetch } = useQuery({
    queryKey: ['fichas-normativas'],
    queryFn: getFichasNormativas,
    staleTime: 30000,
  });

  const [showModal, setShowModal] = React.useState(false);
  const [editingFicha, setEditingFicha] = React.useState<FichaNormativa | null>(null);
  const [formData, setFormData] = React.useState({
    titulo: '',
    norma: '',
    capacidad: '',
    madera: '',
    descripcion: '',
    archivo_pdf: '',
  });

  const [downloading, setDownloading] = React.useState<number | null>(null);

  const handleOpenCreate = () => {
    setEditingFicha(null);
    setFormData({ titulo: '', norma: '', capacidad: '', madera: '', descripcion: '', archivo_pdf: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (ficha: FichaNormativa) => {
    setEditingFicha(ficha);
    setFormData({
      titulo: ficha.titulo,
      norma: ficha.norma,
      capacidad: ficha.capacidad,
      madera: ficha.madera,
      descripcion: ficha.descripcion || '',
      archivo_pdf: ficha.archivo_pdf || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFicha(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFicha) {
        await updateFichaNormativa(editingFicha.id, formData);
      } else {
        await createFichaNormativa(formData);
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      alert('Error al guardar la ficha normativa');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta ficha normativa?')) return;
    try {
      await deleteFichaNormativa(id);
      refetch();
    } catch (error) {
      alert('Error al eliminar la ficha');
      console.error(error);
    }
  };

  const handleDownload = async (ficha: FichaNormativa) => {
    if (!ficha.archivo_pdf) {
      alert('Esta ficha no tiene archivo PDF asociado');
      return;
    }
    setDownloading(ficha.id);
    try {
      const response = await api.get(ficha.archivo_pdf, {
        responseType: 'blob',
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ficha.titulo.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      // Fallback: open in new tab
      window.open(ficha.archivo_pdf, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenPDF = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading && !fichas) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando fichas normativas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-lime-950/80 border border-lime-800/60 rounded-xl text-lime-400">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Fichas Normativas & Especificaciones de Ingeniería</h2>
            <p className="text-xs text-gray-400">Catálogo de planos técnicos, capacidades de carga dinámica/estática y cumplimiento fitosanitario.</p>
          </div>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Nueva Ficha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fichas?.map((f) => (
          <div key={f.id} className="bg-[#181d29] p-5 rounded-xl border border-[#252c3d] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <FileText className="w-4 h-4" /> {f.norma}
              </div>
              <h3 className="font-bold text-white text-md">{f.titulo}</h3>
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <div>• Carga Dinámica: <span className="text-gray-200 font-semibold">{f.capacidad}</span></div>
                <div>• Material: <span className="text-gray-200 font-semibold">{f.madera}</span></div>
                {f.descripcion && <div className="mt-2 text-gray-300">{f.descripcion}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
              {f.archivo_pdf ? (
                <>
                  <button 
                    onClick={() => handleDownload(f)} 
                    disabled={downloading === f.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-xs py-2 rounded-lg font-bold text-gray-200 transition"
                  >
                    {downloading === f.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Descargando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Descargar PDF
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => handleOpenPDF(f.archivo_pdf!)} 
                    className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition" 
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800/50 text-gray-500 cursor-not-allowed text-xs py-2 rounded-lg font-bold" disabled>
                    <Download className="w-3.5 h-3.5" /> Sin PDF
                  </button>
                  <button className="p-2 bg-gray-800/50 text-gray-500 border border-gray-500/20 rounded-lg cursor-not-allowed" disabled title="Sin archivo">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={() => handleOpenEdit(f)} className="p-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-950/80 transition" title="Editar">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(f.id)} className="p-2 bg-red-950/60 text-red-400 border border-red-800/50 rounded-lg hover:bg-red-950/80 transition" title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!fichas || fichas.length === 0) && (
          <div className="md:col-span-3 bg-[#181d29] p-8 rounded-xl border border-[#252c3d] text-center text-gray-400">
            No hay fichas normativas registradas
            <button onClick={handleOpenCreate} className="mt-4 inline-flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
              <Plus className="w-4 h-4" /> Crear primera ficha
            </button>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#10141d] border border-[#1e2430] w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingFicha ? 'Editar' : 'Nueva'} Ficha Normativa</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400">Título *</label>
                <input type="text" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Norma / Estándar *</label>
                <input type="text" value={formData.norma} onChange={(e) => setFormData({...formData, norma: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400">Capacidad de Carga *</label>
                  <input type="text" value={formData.capacidad} onChange={(e) => setFormData({...formData, capacidad: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Tipo de Madera *</label>
                  <input type="text" value={formData.madera} onChange={(e) => setFormData({...formData, madera: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400">Descripción Técnica</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} rows={3} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Archivo PDF (URL)</label>
                <input type="text" value={formData.archivo_pdf} onChange={(e) => setFormData({...formData, archivo_pdf: e.target.value})} className="w-full mt-1 p-2.5 bg-[#181d29] border border-[#252c3d] rounded-xl text-sm font-semibold outline-none focus:border-emerald-500" placeholder="https://ejemplo.com/archivo.pdf" />
                <p className="text-[10px] text-gray-500 mt-1">URL pública del archivo PDF</p>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 bg-lime-400 text-emerald-950 py-2.5 rounded-xl font-black hover:bg-lime-300">{editingFicha ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};