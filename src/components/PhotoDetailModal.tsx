import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { EventPhoto } from '../types';
import { X, Heart, Download, Share2, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { getStyleConfig, createPolaroidExport } from '../utils/filmProcessing';
import { WatermarkFond } from './WatermarkFond';

interface PhotoDetailModalProps {
  photo: EventPhoto | null;
  onClose: () => void;
  onLike?: (photoId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Enlarged polaroid. Tapping the print flips it in 3D to reveal the
 * handwritten dedication on the back.
 */
export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  onClose,
  onLike,
  onNext,
  onPrev,
  hasNext = true,
  hasPrev = true,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Show the front again whenever a different photo is opened
  useEffect(() => {
    setIsFlipped(false);
  }, [photo?.id]);

  if (!photo) return null;

  const styleConfig = getStyleConfig(photo.style);
  const dateLabel = new Date(photo.timestamp)
    .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();

  const handleDownloadPolaroid = async () => {
    setIsExporting(true);
    try {
      const exportUrl = await createPolaroidExport(photo.url, photo.author, photo.caption, 'ES.1983');
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `JardinDeRecuerdos_${photo.author}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Recuerdo de ${photo.author}`,
          text: photo.caption || 'Jardín de Recuerdos - Diario Fotográfico',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#2B211B]">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 font-ui text-xs text-[#FBF7F0]/60">
        <span>
          {dateLabel} · {photo.formattedTime}
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="p-2 text-[#FBF7F0]/80 hover:text-[#FBF7F0] hover:bg-[#FBF7F0]/10 rounded-full transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>

      {hasPrev && (
        <button
          onClick={onPrev}
          aria-label="Anterior"
          className="hidden sm:flex absolute left-6 z-20 p-3 bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/25 text-white rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          aria-label="Siguiente"
          className="hidden sm:flex absolute right-6 z-20 p-3 bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/25 text-white rounded-full transition-all cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Flip card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] flip-scene"
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          onClick={() => setIsFlipped((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsFlipped((v) => !v);
            }
          }}
          className={`flip-card cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF7F0]/70 ${isFlipped ? 'is-flipped' : ''}`}
        >
          {/* Front */}
          <div className="flip-face relative polaroid-frame p-[6%] pb-[7%] select-none">
            <div className="relative aspect-square overflow-hidden bg-[#CFC2AD] polaroid-photo">
              <img
                src={photo.url}
                alt={photo.caption || 'Foto del evento'}
                className={`w-full h-full object-cover ${styleConfig.filterClass}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 film-grain pointer-events-none" />
            </div>
            <div className="pt-[7%] flex items-center justify-between gap-2 font-ui text-sm text-[#2C241E]">
              <span className="truncate">{photo.author}</span>
              <span className="text-[#5C473A]/70 text-xs truncate">{styleConfig.name}</span>
            </div>
          </div>

          {/* Back */}
          <div className="flip-face flip-face-back polaroid-frame polaroid-back p-[6%] pb-[7%] select-none">
            <div className="relative aspect-square polaroid-back-lines border border-[#3F2E24]/12 flex items-center justify-center p-[8%] text-center">
              {photo.caption ? (
                <p className="font-hand text-2xl sm:text-3xl leading-[28px] text-[#4A3A31] break-words">{photo.caption}</p>
              ) : (
                <p className="font-hand text-2xl leading-[28px] text-[#4A3A31]/45 italic">Sin dedicatoria.</p>
              )}
            </div>
            <div className="pt-[7%] flex items-center justify-between gap-2 font-ui text-xs text-[#5C473A]">
              <span className="truncate">— {photo.author}</span>
              <span className="truncate">
                {dateLabel} · {photo.formattedTime}
                {photo.location ? ` · ${photo.location}` : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="relative z-10 mt-4 flex items-center gap-1.5 font-ui text-xs text-[#FBF7F0]/55">
        <RotateCcw size={12} />
        <span>{isFlipped ? 'Toca para volver a la foto' : 'Toca la foto para ver el reverso'}</span>
      </p>

      {/* Actions */}
      <div className="relative z-10 mt-5 flex items-center gap-3">
        <button
          onClick={() => onLike?.(photo.id)}
          className={`h-12 px-4 rounded-xl font-ui text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            photo.hasLiked ? 'bg-[#FAF7F0] text-[#B36D72]' : 'bg-[#FAF7F0] text-[#2C241E]/70 hover:text-[#B36D72]'
          }`}
        >
          <Heart size={16} className={photo.hasLiked ? 'fill-[#B36D72]' : ''} />
          <span>{photo.likes}</span>
        </button>
        <button
          onClick={handleDownloadPolaroid}
          disabled={isExporting}
          className="h-12 px-4 bg-[#FAF7F0] text-[#2C241E] rounded-xl font-ui text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download size={16} />
          <span>{isExporting ? 'Revelando…' : 'Descargar'}</span>
        </button>
        <button
          onClick={handleShare}
          aria-label="Compartir"
          className="h-12 w-12 bg-[#FAF7F0] text-[#2C241E] rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
        >
          {copied ? <Check size={16} className="text-[#68795A]" /> : <Share2 size={16} />}
        </button>
      </div>

      <div className="absolute bottom-4 z-10">
        <WatermarkFond size="sm" variant="light" />
      </div>
    </div>
  );
};
