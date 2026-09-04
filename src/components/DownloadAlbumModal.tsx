import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EventPhoto, EventConfig } from '../types';
import { X, Download, FileArchive, Printer, Check, Sparkles } from 'lucide-react';
import { createPolaroidExport } from '../utils/filmProcessing';
import { WatermarkFond } from './WatermarkFond';

interface DownloadAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: EventPhoto[];
  eventConfig: EventConfig;
}

export const DownloadAlbumModal: React.FC<DownloadAlbumModalProps> = ({
  isOpen,
  onClose,
  photos,
  eventConfig,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleDownloadAllPolaroids = async () => {
    setDownloading(true);
    setProgress(0);
    setCompleted(false);

    try {
      const total = photos.length;
      for (let i = 0; i < total; i++) {
        const photo = photos[i];
        const polaroidDataUrl = await createPolaroidExport(
          photo.url,
          photo.author,
          photo.caption,
          eventConfig.dateOrigin
        );

        const a = document.createElement('a');
        a.href = polaroidDataUrl;
        a.download = `Jardin_Recuerdos_${i + 1}_${photo.author}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setProgress(Math.round(((i + 1) / total) * 100));
        // Small breathing delay
        await new Promise((r) => setTimeout(r, 400));
      }
      setCompleted(true);
    } catch (err) {
      console.error('Batch download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintAlbumSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#2C241E]/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-md bg-[#FAF7F0] border border-[#D4C7B5] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-safe sm:p-8 max-h-[90dvh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#2C241E]/50 hover:text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#68795A]/15 text-[#68795A] flex items-center justify-center mx-auto mb-3">
            <Download size={24} />
          </div>
          <h2 className="font-display text-xl sm:text-3xl font-semibold text-[#2C241E]">
            Descargar mis recuerdos
          </h2>
          <p className="font-ui text-xs text-[#68795A] mt-1 tabular-nums">
            {photos.length} {photos.length === 1 ? 'foto revelada' : 'fotos reveladas'} con película vintage
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleDownloadAllPolaroids}
            disabled={downloading || photos.length === 0}
            className="w-full text-left p-4 rounded-xl border border-[#D4C7B5] bg-[#FBF9F4] hover:border-[#68795A] hover:bg-[#F4EFE6] transition-all flex items-start gap-3.5 group cursor-pointer disabled:opacity-60"
          >
            <div className="p-2.5 bg-[#68795A] text-[#FAF7F0] rounded-lg mt-0.5 shadow-sm">
              <FileArchive size={18} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-base text-[#2C241E]">
                Descargar mis polaroids
              </div>
              <p className="font-ui text-xs text-[#2C241E]/60 mt-0.5">
                Cada foto revelada con marco analógico, lino y tipografía
              </p>
            </div>
          </button>

          <button
            onClick={handlePrintAlbumSheet}
            className="w-full text-left p-4 rounded-xl border border-[#D4C7B5] bg-[#FBF9F4] hover:border-[#68795A] hover:bg-[#F4EFE6] transition-all flex items-start gap-3.5 group cursor-pointer"
          >
            <div className="p-2.5 bg-[#C48B9F] text-[#FAF7F0] rounded-lg mt-0.5 shadow-sm">
              <Printer size={18} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-base text-[#2C241E]">
                Imprimir hoja de contactos
              </div>
              <p className="font-ui text-xs text-[#2C241E]/60 mt-0.5">
                Hoja de contactos imprimible en alta definición
              </p>
            </div>
          </button>
        </div>

        {/* Progress Bar if downloading */}
        {downloading && (
          <div className="mb-6 p-4 bg-[#F4EFE6] rounded-xl border border-[#D4C7B5]/60">
            <div className="flex justify-between text-xs font-ui text-[#2C241E] mb-2">
              <span>Revelando recuerdos...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#D4C7B5]/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#68795A] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {completed && (
          <div className="mb-6 p-3 bg-[#68795A]/15 border border-[#68795A]/30 rounded-xl flex items-center gap-2 text-xs font-ui text-[#68795A]">
            <Check size={16} />
            <span>¡Todos los recuerdos se descargaron con éxito!</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#2C241E]/50 font-ui pt-3 border-t border-[#D4C7B5]/40">
          <span>{eventConfig.title}</span>
          <WatermarkFond size="sm" variant="dark" />
        </div>
      </motion.div>
    </div>
  );
};
