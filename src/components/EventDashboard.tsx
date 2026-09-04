import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Grid, Download, Users, Heart, Clock, Sparkles, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { EventConfig, EventPhoto, Contributor } from '../types';
import { PolaroidCard } from './PolaroidCard';
import { WatermarkFond } from './WatermarkFond';
import { FloralTwoFlowersSvg, VintageFlourish } from './FloralArtSvg';

interface EventDashboardProps {
  eventConfig: EventConfig;
  photos: EventPhoto[];
  contributors: Contributor[];
  currentUser: string;
  onOpenLiveCamera: () => void;
  onOpenGallery: () => void;
  onOpenDownloadModal: () => void;
  onOpenPeopleModal: () => void;
  onLikePhoto: (photoId: string) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
  onDownloadSinglePhoto: (photo: EventPhoto) => void;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  eventConfig,
  photos,
  contributors,
  currentUser,
  onOpenLiveCamera,
  onOpenGallery,
  onOpenDownloadModal,
  onOpenPeopleModal,
  onLikePhoto,
  onSelectPhoto,
  onDownloadSinglePhoto,
}) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Live timer countdown state
  const [timeLeft, setTimeLeft] = useState(eventConfig.timeLeftSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const totalMomentsFormatted = (eventConfig.totalMoments + (photos.length - 8)).toLocaleString();

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#F8F5EE] text-[#2C241E] overflow-x-hidden selection:bg-[#C48B9F]/30">
      {/* Background with floral close-up (subtly blurred & warm) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1920&q=80"
          alt="Jardín fondo"
          className="w-full h-full object-cover object-center filter blur-xl opacity-20 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linen-pattern opacity-60" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full pt-8 pb-4 px-4 sm:px-8 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Origin Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-typewriter text-xs tracking-[0.25em] text-[#68795A] uppercase">
            {eventConfig.dateOrigin}
          </span>
          <span className="text-[#D4A373] text-xs">•</span>
          <span className="font-typewriter text-xs tracking-widest text-[#2C241E]/60 uppercase">
            Jardín Privado
          </span>
        </div>

        {/* Main Event Title */}
        <h1 className="font-serif-vintage text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#2C241E] mb-1">
          {eventConfig.title}
        </h1>

        <p className="font-script-hand text-2xl sm:text-3xl text-[#68795A] mb-4">
          Diario de recuerdos compartidos
        </p>

        {/* Vintage Divider Flourish */}
        <VintageFlourish className="mb-6 opacity-75" />

        {/* Three Column Data Counters */}
        <div className="w-full max-w-lg bg-[#FAF7F0]/80 backdrop-blur-sm border border-[#D4C7B5] rounded-2xl py-4 px-3 sm:px-6 shadow-sm mb-6">
          <div className="grid grid-cols-3 divide-x divide-[#D4C7B5]/60 text-center">
            {/* Column 1: Moments */}
            <div className="px-2">
              <div className="font-serif-vintage text-2xl sm:text-3xl font-bold text-[#2C241E]">
                {totalMomentsFormatted}
              </div>
              <div className="font-typewriter text-[11px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5">
                Momentos
              </div>
            </div>

            {/* Column 2: Time Left */}
            <div className="px-2">
              <div className="font-serif-vintage text-2xl sm:text-3xl font-bold text-[#68795A] flex items-center justify-center gap-1">
                <span>{formatCountdown(timeLeft)}</span>
              </div>
              <div className="font-typewriter text-[11px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5">
                Tiempo Restante
              </div>
            </div>

            {/* Column 3: People (Clickable) */}
            <button
              onClick={onOpenPeopleModal}
              className="px-2 group hover:bg-[#2C241E]/5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="font-serif-vintage text-2xl sm:text-3xl font-bold text-[#C48B9F] group-hover:scale-105 transition-transform">
                {eventConfig.totalPeople}
              </div>
              <div className="font-typewriter text-[11px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <span>Invitados</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C48B9F]" />
              </div>
            </button>
          </div>
        </div>

        {/* Main Pill Buttons Area */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
          {/* Small Square Button: Grid / Gallery View */}
          <button
            onClick={onOpenGallery}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#2C241E] rounded-2xl border border-[#D4C7B5] shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
            title="Ver mosaico completo"
          >
            <Grid size={22} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Large White Pill Button with Camera Icon (Principal CTA) */}
          <button
            onClick={onOpenLiveCamera}
            className="flex-1 max-w-[240px] bg-[#FFFFFF] hover:bg-[#FAF7F0] text-[#2C241E] py-3.5 sm:py-4 px-6 rounded-full border border-[#D4C7B5] shadow-lg flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer group hover:shadow-xl"
          >
            <div className="w-8 h-8 rounded-full bg-[#2C241E] text-[#FAF7F0] flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Camera size={18} />
            </div>
            <span className="font-serif-vintage font-bold text-base sm:text-lg tracking-wide">
              Tomar Foto
            </span>
          </button>

          {/* Small Square Button: Download Full Album */}
          <button
            onClick={onOpenDownloadModal}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#2C241E] rounded-2xl border border-[#D4C7B5] shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
            title="Descargar álbum completo"
          >
            <Download size={22} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Section: Stacked Polaroid Deck & Feed */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col items-center">
        {/* View Toggle Bar (Stacked Deck vs Grid) */}
        <div className="w-full flex items-center justify-between max-w-4xl mb-6 pb-2 border-b border-[#D4C7B5]/60">
          <div className="flex items-center gap-2">
            <span className="font-serif-vintage text-lg font-semibold text-[#2C241E]">
              Carrete del Evento
            </span>
            <span className="text-xs font-typewriter text-[#68795A] bg-[#68795A]/10 px-2 py-0.5 rounded-full">
              {photos.length} reveladas
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#D4C7B5]">
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-3 py-1 rounded-lg text-xs font-typewriter transition-all cursor-pointer ${
                viewMode === 'stacked'
                  ? 'bg-[#2C241E] text-[#FAF7F0] font-bold shadow-sm'
                  : 'text-[#2C241E]/70 hover:text-[#2C241E]'
              }`}
            >
              Mazo Polaroid
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-typewriter transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#2C241E] text-[#FAF7F0] font-bold shadow-sm'
                  : 'text-[#2C241E]/70 hover:text-[#2C241E]'
              }`}
            >
              Cuadrícula
            </button>
          </div>
        </div>

        {/* Stacked Deck View */}
        {viewMode === 'stacked' ? (
          <div className="w-full max-w-4xl flex flex-col items-center py-4">
            {/* Featured Hero Polaroid with Interactive Stack */}
            <div className="relative w-full max-w-md mx-auto py-2">
              {photos.length > 0 && (
                <div className="relative">
                  {/* Underneath Stacked Ghost Polaroids for 3D Layering effect */}
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 bg-[#FAF7F0] rounded-md border border-[#D4C7B5]/50 shadow-md opacity-70 pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-2.5 translate-y-2 -rotate-2 bg-[#FAF7F0] rounded-md border border-[#D4C7B5]/50 shadow-md opacity-70 pointer-events-none" />

                  {/* Active Top Polaroid */}
                  <PolaroidCard
                    photo={photos[activePhotoIndex % photos.length]}
                    isStacked={false}
                    onLike={onLikePhoto}
                    onOpenDetail={onSelectPhoto}
                    onDownloadSingle={onDownloadSinglePhoto}
                  />
                </div>
              )}

              {/* Stack Navigation Arrows */}
              <div className="flex items-center justify-between mt-4 px-2">
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                  }
                  className="p-2.5 bg-[#FAF7F0] border border-[#D4C7B5] hover:bg-[#F4EFE6] text-[#2C241E] rounded-full shadow-sm transition-all cursor-pointer hover:scale-105"
                  title="Foto anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="font-typewriter text-xs text-[#68795A]">
                  Recuerdo {((activePhotoIndex % photos.length) + 1)} de {photos.length}
                </div>

                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) => (prev + 1) % photos.length)
                  }
                  className="p-2.5 bg-[#FAF7F0] border border-[#D4C7B5] hover:bg-[#F4EFE6] text-[#2C241E] rounded-full shadow-sm transition-all cursor-pointer hover:scale-105"
                  title="Foto siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Horizontal Mini Polaroid Filmstrip */}
            <div className="w-full mt-8 overflow-x-auto pb-4">
              <div className="flex items-center gap-4 px-2 min-w-max">
                {photos.map((photo, idx) => {
                  const isSelected = (activePhotoIndex % photos.length) === idx;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setActivePhotoIndex(idx)}
                      style={{ transform: `rotate(${photo.rotationDeg * 0.7}deg)` }}
                      className={`w-32 sm:w-36 bg-[#FAF7F0] p-2 rounded polaroid-frame border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#2C241E] scale-105 z-10 shadow-lg'
                          : 'border-[#D4C7B5]/60 opacity-80 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <div className="aspect-[4/5] rounded-[1px] overflow-hidden bg-[#2C241E] mb-1.5">
                        <img
                          src={photo.url}
                          alt="Miniatura"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="font-typewriter text-[10px] truncate text-[#2C241E] font-medium">
                        {photo.author}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
            {photos.map((photo, idx) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                index={idx}
                isStacked={true}
                onLike={onLikePhoto}
                onOpenDetail={onSelectPhoto}
                onDownloadSingle={onDownloadSinglePhoto}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer with Watermark 'fond' */}
      <footer className="relative z-10 w-full py-8 text-center border-t border-[#D4C7B5]/60 bg-[#FAF7F0]/60">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-typewriter text-[#2C241E]/50">
            <span>{eventConfig.title}</span>
            <span>•</span>
            <span>{eventConfig.dateOrigin}</span>
          </div>
          <WatermarkFond size="md" variant="dark" />
        </div>
      </footer>
    </div>
  );
};
