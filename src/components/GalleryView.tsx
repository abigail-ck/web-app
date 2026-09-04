import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { EventPhoto, PhotoStyleId } from '../types';
import { PolaroidCard } from './PolaroidCard';
import { X, Search, Filter, Play, Layers, Grid as GridIcon, Sparkles } from 'lucide-react';
import { PHOTO_STYLES } from '../utils/filmProcessing';
import { WatermarkFond } from './WatermarkFond';

interface GalleryViewProps {
  photos: EventPhoto[];
  onClose: () => void;
  onLikePhoto: (id: string) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
  onOpenDownloadModal: () => void;
  onOpenPeopleModal: () => void;
  initialFilterAuthor?: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  onClose,
  onLikePhoto,
  onSelectPhoto,
  onOpenDownloadModal,
  onOpenPeopleModal,
  initialFilterAuthor = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>(initialFilterAuthor);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // Extract unique authors
  const authors = useMemo(() => {
    const list = Array.from(new Set(photos.map((p) => p.author)));
    return list;
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.caption && p.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStyle = selectedStyle === 'all' || p.style === selectedStyle;
      const matchAuthor = selectedAuthor === 'all' || p.author === selectedAuthor;

      return matchSearch && matchStyle && matchAuthor;
    });
  }, [photos, searchQuery, selectedStyle, selectedAuthor]);

  // Slideshow auto advance
  React.useEffect(() => {
    if (!isSlideshow || filteredPhotos.length === 0) return;
    const interval = setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % filteredPhotos.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isSlideshow, filteredPhotos.length]);

  return (
    <div className="fixed inset-0 z-40 bg-[#F8F5EE] overflow-y-auto flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#D4C7B5] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors cursor-pointer"
            title="Volver al diario"
          >
            <X size={22} />
          </button>
          <div>
            <h1 className="font-serif-vintage text-2xl sm:text-3xl text-[#2C241E] font-medium leading-none">
              Mosaico de Recuerdos
            </h1>
            <p className="font-typewriter text-xs text-[#68795A] mt-1">
              {filteredPhotos.length} momentos mostrados
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSlideshow(!isSlideshow)}
            className={`px-3 py-1.5 rounded-full text-xs font-typewriter flex items-center gap-1.5 transition-all cursor-pointer ${
              isSlideshow
                ? 'bg-[#68795A] text-[#FAF7F0] font-bold'
                : 'bg-[#FAF7F0] border border-[#D4C7B5] text-[#2C241E] hover:bg-[#F4EFE6]'
            }`}
          >
            <Play size={13} />
            <span className="hidden sm:inline">Diaporama</span>
          </button>

          <button
            onClick={onOpenDownloadModal}
            className="px-3 py-1.5 bg-[#2C241E] text-[#FAF7F0] hover:bg-[#3D2B24] rounded-full text-xs font-typewriter transition-all cursor-pointer"
          >
            Descargar Todo
          </button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F0] border-b border-[#D4C7B5]/60 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C241E]/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por invitado, lugar, nota..."
              className="w-full pl-9 pr-4 py-2 bg-[#FBF9F4] border border-[#D4C7B5] rounded-xl text-xs font-typewriter text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#68795A]"
            />
          </div>

          {/* Style & Author Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Style Pills */}
            <div className="flex items-center gap-1.5 bg-[#F4EFE6] p-1 rounded-xl border border-[#D4C7B5]/40 text-xs font-typewriter">
              <button
                onClick={() => setSelectedStyle('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStyle === 'all'
                    ? 'bg-[#2C241E] text-[#FAF7F0]'
                    : 'text-[#2C241E]/70 hover:text-[#2C241E]'
                }`}
              >
                Todos los Estilos
              </button>
              {PHOTO_STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedStyle === st.id
                      ? 'bg-[#2C241E] text-[#FAF7F0]'
                      : 'text-[#2C241E]/70 hover:text-[#2C241E]'
                  }`}
                >
                  {st.badge}
                </button>
              ))}
            </div>

            {/* Author Dropdown */}
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="bg-[#F4EFE6] border border-[#D4C7B5]/60 text-[#2C241E] text-xs font-typewriter rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Invitados</option>
              {authors.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {isSlideshow && filteredPhotos.length > 0 ? (
          /* Fullscreen Slideshow Mode */
          <div className="max-w-2xl mx-auto py-4 flex flex-col items-center">
            <motion.div
              key={filteredPhotos[slideshowIndex].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <PolaroidCard
                photo={filteredPhotos[slideshowIndex]}
                onLike={onLikePhoto}
                onOpenDetail={onSelectPhoto}
              />
            </motion.div>
            <div className="flex items-center gap-2 mt-4 text-xs font-typewriter text-[#68795A]">
              <span>
                {slideshowIndex + 1} de {filteredPhotos.length}
              </span>
              <span>• Pase de diapositivas analógico</span>
            </div>
          </div>
        ) : (
          /* Grid View */
          <>
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif-vintage text-2xl text-[#2C241E]/60 italic">
                  Ningún recuerdo coincide con esta búsqueda.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStyle('all');
                    setSelectedAuthor('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#FAF7F0] border border-[#D4C7B5] rounded-xl text-xs font-typewriter text-[#2C241E] hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((photo, idx) => (
                  <PolaroidCard
                    key={photo.id}
                    photo={photo}
                    index={idx}
                    onLike={onLikePhoto}
                    onOpenDetail={onSelectPhoto}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF7F0] border-t border-[#D4C7B5]/60 py-6 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-typewriter text-[#2C241E]/50">
            JARDÍN DE RECUERDOS • COLECCIÓN ANALÓGICA
          </span>
          <WatermarkFond size="md" variant="dark" />
        </div>
      </footer>
    </div>
  );
};
