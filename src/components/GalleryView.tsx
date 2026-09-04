import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { EventPhoto } from '../types';
import { PolaroidCard } from './PolaroidCard';
import { X, Search, Play, Camera, Lock, ArrowRight } from 'lucide-react';
import { PHOTO_STYLES } from '../utils/filmProcessing';
import { WatermarkFond } from './WatermarkFond';

interface GalleryViewProps {
  photos: EventPhoto[]; // the current guest's photos only
  onClose: () => void;
  onLikePhoto: (id: string) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
  onOpenReveal: () => void;
  onOpenCamera: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  onClose,
  onLikePhoto,
  onSelectPhoto,
  onOpenReveal,
  onOpenCamera,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  const filteredPhotos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return photos.filter((p) => {
      const matchSearch =
        !q ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q));
      const matchStyle = selectedStyle === 'all' || p.style === selectedStyle;
      return matchSearch && matchStyle;
    });
  }, [photos, searchQuery, selectedStyle]);

  useEffect(() => {
    if (!isSlideshow || filteredPhotos.length === 0) return;
    const interval = setInterval(() => setSlideshowIndex((prev) => (prev + 1) % filteredPhotos.length), 3800);
    return () => clearInterval(interval);
  }, [isSlideshow, filteredPhotos.length]);

  useEffect(() => {
    if (slideshowIndex >= filteredPhotos.length) setSlideshowIndex(0);
  }, [filteredPhotos.length, slideshowIndex]);

  return (
    <div className="fixed inset-0 z-40 bg-[#F8F5EE] overflow-y-auto flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#D4C7B5] pt-safe px-3 sm:px-8 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={onClose}
            aria-label="Volver"
            className="p-2 text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl text-[#2C241E] font-medium leading-none truncate">Mis recuerdos</h1>
            <p className="font-ui text-xs text-[#68795A] mt-1 tabular-nums">
              {filteredPhotos.length} de {photos.length} fotos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {photos.length > 1 && (
            <button
              onClick={() => setIsSlideshow(!isSlideshow)}
              aria-label="Pase de fotos"
              className={`h-9 px-3 rounded-full font-ui text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSlideshow
                  ? 'bg-[#68795A] text-[#FAF7F0]'
                  : 'bg-[#FAF7F0] border border-[#D4C7B5] text-[#2C241E] hover:bg-[#F4EFE6]'
              }`}
            >
              <Play size={13} />
              <span>Pase de fotos</span>
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      {photos.length > 0 && (
        <div className="bg-[#FAF7F0] border-b border-[#D4C7B5]/60 px-3 sm:px-8 py-3 flex flex-col gap-2.5">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C241E]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por dedicatoria o lugar"
              className="w-full h-10 pl-9 pr-4 bg-[#FBF9F4] border border-[#D4C7B5] rounded-xl font-ui text-sm text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#68795A]"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {[{ id: 'all', badge: 'Todos' }, ...PHOTO_STYLES].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id)}
                className={`shrink-0 h-8 px-3 rounded-full font-ui text-xs transition-colors cursor-pointer ${
                  selectedStyle === st.id
                    ? 'bg-[#2C241E] text-[#FAF7F0]'
                    : 'bg-[#F4EFE6] border border-[#D4C7B5]/60 text-[#2C241E]/70 hover:text-[#2C241E]'
                }`}
              >
                {st.badge.charAt(0) + st.badge.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {photos.length === 0 ? (
          <div className="max-w-xs mx-auto text-center py-10 flex flex-col items-center gap-4">
            <div className="polaroid-frame relative w-36 p-[6%] pb-[7%] rotate-[2deg]">
              <div className="aspect-square bg-[#E4DCCE] polaroid-photo flex items-center justify-center">
                <Camera size={26} className="text-[#2C241E]/25" />
              </div>
            </div>
            <p className="font-ui text-sm text-[#2C241E]/70 leading-relaxed">
              Todavía no has tomado ninguna foto. Aquí verás las que captures durante el evento.
            </p>
            <button
              onClick={onOpenCamera}
              className="font-display font-medium text-sm bg-[#2C241E] text-[#FAF7F0] px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Capturar un momento
            </button>
          </div>
        ) : isSlideshow && filteredPhotos.length > 0 ? (
          <div className="max-w-[360px] mx-auto py-2 flex flex-col items-center">
            <motion.div
              key={filteredPhotos[slideshowIndex].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <PolaroidCard photo={filteredPhotos[slideshowIndex]} onLike={onLikePhoto} onOpenDetail={onSelectPhoto} />
            </motion.div>
            <span className="mt-4 font-ui text-xs text-[#68795A] tabular-nums">
              {slideshowIndex + 1} de {filteredPhotos.length}
            </span>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <p className="font-display text-lg text-[#2C241E]/60">Ninguna foto coincide con la búsqueda.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStyle('all');
              }}
              className="px-4 py-2 bg-[#FAF7F0] border border-[#D4C7B5] rounded-xl font-ui text-xs text-[#2C241E] hover:bg-[#F4EFE6] cursor-pointer"
            >
              Quitar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredPhotos.map((photo, idx) => (
              <PolaroidCard key={photo.id} photo={photo} index={idx} onLike={onLikePhoto} onOpenDetail={onSelectPhoto} />
            ))}
          </div>
        )}

        {/* Link to the shared album */}
        <button
          onClick={onOpenReveal}
          className="mt-8 w-full max-w-md mx-auto text-left bg-[#FAF7F0]/80 border border-dashed border-[#D4C7B5] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#FAF7F0] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span className="shrink-0 w-11 h-11 rounded-xl bg-[#2C241E]/5 text-[#68795A] flex items-center justify-center">
            <Lock size={18} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-display font-medium text-sm text-[#2C241E]">Todos los recuerdos del evento</span>
            <span className="block font-ui text-xs text-[#2C241E]/60 mt-0.5">Se revelarán cuando termine el evento.</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-[#2C241E]/50" />
        </button>
      </main>

      <footer className="bg-[#FAF7F0] border-t border-[#D4C7B5]/60 py-5 pb-safe px-4 text-center">
        <WatermarkFond size="md" variant="dark" />
      </footer>
    </div>
  );
};
