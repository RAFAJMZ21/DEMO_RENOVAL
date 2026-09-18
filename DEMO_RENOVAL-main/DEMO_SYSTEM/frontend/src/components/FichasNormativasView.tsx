import React from 'react';
import { FolderOpen, FileText, Download } from 'lucide-react';

export const FichasNormativasView: React.FC = () => {
  const fichas = [
    { titulo: 'Tarima Estándar 40" x 48" Barrote Saque', norma: 'GMA / NOM-144', capacidad: '1,500 kg', madera: 'Pino estufado' },
    { titulo: 'Tarima Perimetral Tipo Euro (1200 x 1000)', norma: 'EPAL / ISO 6780', capacidad: '2,000 kg', madera: 'Pino de primera' },
    { titulo: 'Caja Embalaje Industrial Cerrada', norma: 'Exportación Pesada', capacidad: '3,500 kg', madera: 'Triplay + Pino reforzado' },
  ];

  return (
    <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] text-white space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="w-6 h-6 text-lime-400" />
        <div>
          <h2 className="text-xl font-bold">Fichas Normativas & Especificaciones de Ingeniería</h2>
          <p className="text-xs text-gray-400">Catálogo de planos técnicos, capacidades de carga dinámica/estática y cumplimiento fitosanitario.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fichas.map((f, i) => (
          <div key={i} className="bg-[#181d29] p-5 rounded-xl border border-[#252c3d] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <FileText className="w-4 h-4" /> {f.norma}
              </div>
              <h3 className="font-bold text-white text-md">{f.titulo}</h3>
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <div>• Carga Dinámica: <span className="text-gray-200 font-semibold">{f.capacidad}</span></div>
                <div>• Material: <span className="text-gray-200 font-semibold">{f.madera}</span></div>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-xs py-2 rounded-lg font-bold text-gray-200 transition">
              <Download className="w-3.5 h-3.5" /> Descargar Ficha PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};