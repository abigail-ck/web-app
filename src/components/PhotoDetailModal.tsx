import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventPhoto } from '../types';
import { X, Heart, Download, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

  if (!photo) return null;

  const styleConfig = getStyleConfig(photo.style);

  const handleDownloadPolaroid = async () => {
    setIsExporting(true);
    try {
      const exportUrl = await createPolaroidExport(
        photo.url,
        photo.author,
        photo.caption,
        'ES.1983'
      );
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
      navigator.share({
        title: `Recuerdo de ${photo.author}`,
        text: photo.caption || 'Jardín de Recuerdos - Diario Fotográfico',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C241E]/80 backdrop-blur-md">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Prev / Next Buttons on Desktop */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="hidden sm:flex absolute left-6 z-20 p-3 bg-[#FAF7F0]/20 hover:bg-[#FAF7F0]/40 text-white rounded-full backdrop-blur-sm transition-all cursor-pointer hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="hidden sm:flex absolute right-6 z-20 p-3 bg-[#FAF7F0]/20 hover:bg-[#FAF7F0]/40 text-white rounded-full backdrop-blur-sm transition-all cursor-pointer hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Main Polaroid Frame Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 w-full max-w-md bg-[#FAF7F0] p-4 sm:p-6 rounded-md shadow-2xl border border-[#D4C7B5] flex flex-col justify-between max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button Top */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[#2C241E]/50 hover:text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Photo Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[#2C241E] shadow-inner mb-4">
          <img
            src={photo.url}
            alt={photo.caption || 'Foto del evento'}
            className={`w-full h-full object-cover ${styleConfig.filterClass}`}
            referrerPolicy="no-referrer"
          />
          {/* Film Grain Texture */}
          <div className="absolute inset-0 film-grain pointer-events-none" />

          {/* Style Badge */}
          <div className="absolute top-3 left-3 bg-[#2C241E]/75 text-[#FAF7F0] font-typewriter text-[11px] px-2.5 py-1 rounded backdrop-blur-sm border border-[#FAF7F0]/20">
            {styleConfig.name}
          </div>
        </div>

        {/* Polaroid Lower Paper Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#D4C7B5]/40 pb-2">
            <div>
              <span className="font-typewriter font-bold text-base text-[#2C241E]">
                {photo.author}
              </span>
              <div className="flex items-center gap-2 text-xs font-typewriter text-[#68795A]">
                <span>{photo.formattedTime}</span>
                {photo.location && <span>• {photo.location}</span>}
              </div>
            </div>

            <button
              onClick={() => onLike?.(photo.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-typewriter transition-all cursor-pointer ${
                photo.hasLiked
                  ? 'text-[#B36D72] bg-[#B36D72]/15 font-bold'
                  : 'text-[#2C241E]/60 hover:text-[#B36D72] hover:bg-[#B36D72]/10'
              }`}
            >
              <Heart
                size={16}
                className={photo.hasLiked ? 'fill-[#B36D72]' : ''}
              />
              <span>{photo.likes} me gusta</span>
            </button>
          </div>

          {/* Caption */}
          {photo.caption && (
            <p className="font-serif-vintage italic text-base sm:text-lg text-[#3D2B24] leading-relaxed">
              &ldquo;{photo.caption}&rdquo;
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={handleDownloadPolaroid}
              disabled={isExporting}
              className="flex-1 bg-[#2C241E] hover:bg-[#3D2B24] text-[#FAF7F0] py-2.5 px-4 rounded-xl font-typewriter text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download size={15} />
              <span>{isExporting ? 'Revelando...' : 'Descargar Polaroid'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 bg-[#FAF7F0] border border-[#D4C7B5] hover:bg-[#F4EFE6] text-[#2C241E] rounded-xl transition-all cursor-pointer"
              title="Compartir recuerdo"
            >
              {copied ? <Check size={16} className="text-[#68795A]" /> : <Share2 size={16} />}
            </button>
          </div>

          {/* Bottom Watermark */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-typewriter text-[#2C241E]/40">
            <span>ES.1983 • Jardín de Recuerdos</span>
            <WatermarkFond size="sm" variant="dark" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
