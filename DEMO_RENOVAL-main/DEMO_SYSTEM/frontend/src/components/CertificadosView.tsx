import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCertificadosFitosanitarios, downloadCertificadoPDF } from '../api/modulos';
import { ShieldCheck, Download, Flame, Loader2, AlertCircle } from 'lucide-react';

export const CertificadosView: React.FC = () => {
  const { data: certificados, isLoading, refetch } = useQuery({
    queryKey: ['certificados-ht'],
    queryFn: getCertificadosFitosanitarios,
  });

  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDescargarPDF = async (folio: string) => {
    setDownloading(folio);
    try {
      const blob = await downloadCertificadoPDF(folio);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificado_${folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el certificado. Verifique que el certificado existe.');
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading && !certificados) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Cargando certificados NOM-144...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Emisión de Certificados Fitosanitarios NOM-144-SEMARNAT</h2>
            <p className="text-xs text-gray-400">Documentación oficial de tratamiento térmico (HT) para tarimas de exportación.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] px-4 py-2 rounded-xl text-xs font-mono text-lime-400">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Sello Oficial Autorizado: MX - 144 HT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificados?.map((cert) => (
          <div key={cert.id} className="bg-[#10141d] p-5 rounded-2xl border border-[#1e2430] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-emerald-400 font-bold">{cert.folio_certificado}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  LIBERADO
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-md">{cert.cliente}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Lote: <strong className="text-gray-200">{cert.folio_lote}</strong></p>
              </div>

              <div className="bg-[#181d29] p-3 rounded-xl border border-[#252c3d] text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Sello Térmico:</span>
                  <span className="text-white font-bold">{cert.codigo_sello_ht}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Temp. Núcleo:</span>
                  <span className="text-lime-400 font-bold">{cert.temperatura_alcanzada} °C</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sostenimiento:</span>
                  <span className="text-amber-400 font-bold">{cert.tiempo_sostenimiento_min} min</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Fecha Emisión:</span>
                  <span className="text-gray-300">{cert.fecha_emision}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleDescargarPDF(cert.folio_certificado)}
              disabled={downloading === cert.folio_certificado}
              className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 disabled:cursor-not-allowed text-emerald-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
            >
              {downloading === cert.folio_certificado ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Certificado PDF</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};