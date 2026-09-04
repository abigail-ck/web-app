import React, { useState, useEffect } from 'react';
import { Camera, Grid, Download, ChevronLeft, ChevronRight, Lock, ArrowRight } from 'lucide-react';
import { EventConfig, EventPhoto } from '../types';
import { PolaroidCard } from './PolaroidCard';
import { WatermarkFond } from './WatermarkFond';
import { VintageFlourish } from './FloralArtSvg';

interface EventDashboardProps {
  eventConfig: EventConfig;
  myPhotos: EventPhoto[]; // only the current guest's photos are visible for now
  totalMoments: number;
  currentUser: string;
  onOpenLiveCamera: () => void;
  onOpenGallery: () => void;
  onOpenDownloadModal: () => void;
  onOpenPeopleModal: () => void;
  onOpenReveal: () => void;
  onLikePhoto: (photoId: string) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
  onDownloadSinglePhoto: (photo: EventPhoto) => void;
}

export const formatCountdown = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const EventDashboard: React.FC<EventDashboardProps> = ({
  eventConfig,
  myPhotos,
  totalMoments,
  currentUser,
  onOpenLiveCamera,
  onOpenGallery,
  onOpenDownloadModal,
  onOpenPeopleModal,
  onOpenReveal,
  onLikePhoto,
  onSelectPhoto,
  onDownloadSinglePhoto,
}) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(eventConfig.timeLeftSeconds);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep the active index valid when photos are added or removed
  useEffect(() => {
    if (activePhotoIndex >= myPhotos.length) setActivePhotoIndex(0);
  }, [myPhotos.length, activePhotoIndex]);

  const hasPhotos = myPhotos.length > 0;
  const activePhoto = hasPhotos ? myPhotos[activePhotoIndex % myPhotos.length] : null;

  return (
    <div className="relative min-h-dvh w-full flex flex-col bg-[#F8F5EE] text-[#2C241E] overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="w-full h-full object-cover object-center filter blur-xl opacity-20 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linen-pattern opacity-60" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full pt-safe px-4 sm:px-8 max-w-3xl mx-auto flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-between font-ui text-[11px] tracking-[0.2em] uppercase text-[#68795A] pt-2">
          <span>{eventConfig.dateOrigin}</span>
          <span className="normal-case tracking-normal text-[#2C241E]/60">— {currentUser}</span>
        </div>

        <h1 className="font-display text-[1.75rem] leading-[1.1] sm:text-4xl md:text-5xl font-semibold text-[#2C241E] mt-3 [text-wrap:balance]">
          {eventConfig.title}
        </h1>
        <p className="font-ui text-sm sm:text-base text-[#68795A] mt-1.5">{eventConfig.subtitle}</p>

        <VintageFlourish className="my-4 opacity-75" />

        {/* Counters */}
        <div className="w-full max-w-md bg-[#FAF7F0]/80 backdrop-blur-sm border border-[#D4C7B5] rounded-2xl py-3.5 px-2 sm:px-6 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-[#D4C7B5]/60 text-center">
            <div className="px-1">
              <div className="font-display text-xl sm:text-3xl font-semibold text-[#2C241E] tabular-nums">
                {totalMoments.toLocaleString('es-ES')}
              </div>
              <div className="font-ui text-[10px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5">Momentos</div>
            </div>
            <div className="px-1">
              <div className="font-display text-xl sm:text-3xl font-semibold text-[#68795A] tabular-nums">
                {formatCountdown(timeLeft)}
              </div>
              <div className="font-ui text-[10px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5 leading-tight">
                Tiempo restante
              </div>
            </div>
            <button
              onClick={onOpenPeopleModal}
              className="px-1 rounded-lg hover:bg-[#2C241E]/5 active:bg-[#2C241E]/10 transition-colors cursor-pointer"
            >
              <div className="font-display text-xl sm:text-3xl font-semibold text-[#C48B9F] tabular-nums">
                {eventConfig.totalPeople}
              </div>
              <div className="font-ui text-[10px] sm:text-xs text-[#2C241E]/60 uppercase tracking-wider mt-0.5">Invitados ›</div>
            </button>
          </div>
        </div>

        {/* Main actions */}
        <div className="mt-5 flex items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={onOpenGallery}
            aria-label="Mis recuerdos"
            title="Mis recuerdos"
            className="shrink-0 w-13 h-13 sm:w-14 sm:h-14 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#2C241E] rounded-2xl border border-[#D4C7B5] shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <Grid size={22} />
          </button>

          <button
            onClick={onOpenLiveCamera}
            className="flex-1 min-w-0 h-13 sm:h-14 bg-white hover:bg-[#FAF7F0] text-[#2C241E] px-4 rounded-full border border-[#D4C7B5] shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] cursor-pointer"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-[#2C241E] text-[#FAF7F0] flex items-center justify-center">
              <Camera size={17} />
            </span>
            <span className="font-display font-semibold text-base sm:text-lg truncate"><span className="sm:hidden">Capturar</span><span className="hidden sm:inline">Capturar un momento</span></span>
          </button>

          <button
            onClick={onOpenDownloadModal}
            aria-label="Descargar mis polaroids"
            title="Descargar mis polaroids"
            className="shrink-0 w-13 h-13 sm:w-14 sm:h-14 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#2C241E] rounded-2xl border border-[#D4C7B5] shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <Download size={22} />
          </button>
        </div>
      </header>

      {/* My photos */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex flex-col items-center gap-6">
        <div className="w-full flex items-center justify-between gap-3 pb-2 border-b border-[#D4C7B5]/60">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-display text-lg font-semibold text-[#2C241E] truncate">Mis recuerdos</h2>
            <span className="shrink-0 font-ui text-[11px] text-[#68795A] bg-[#68795A]/10 px-2 py-0.5 rounded-full tabular-nums">
              {myPhotos.length}
            </span>
          </div>

          {hasPhotos && (
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#D4C7B5] shrink-0">
              {(['stacked', 'grid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg font-ui text-xs transition-all cursor-pointer ${
                    viewMode === mode ? 'bg-[#2C241E] text-[#FAF7F0]' : 'text-[#2C241E]/70 hover:text-[#2C241E]'
                  }`}
                >
                  {mode === 'stacked' ? 'Polaroid' : 'Cuadrícula'}
                </button>
              ))}
            </div>
          )}
        </div>

        {!hasPhotos ? (
          /* Empty state */
          <div className="w-full max-w-xs flex flex-col items-center text-center gap-4 py-6">
            <div className="polaroid-frame relative w-40 p-[6%] pb-[7%] rotate-[-2deg]">
              <div className="aspect-square bg-[#E4DCCE] polaroid-photo flex items-center justify-center">
                <Camera size={28} className="text-[#2C241E]/25" />
              </div>
              <div className="pt-[7%] font-hand text-base text-[#68795A]/70">tu primer recuerdo</div>
            </div>
            <p className="font-ui text-sm text-[#2C241E]/70 leading-relaxed">
              Aún no has capturado ningún momento. Tus fotos aparecerán aquí en cuanto tomes la primera.
            </p>
            <button
              onClick={onOpenLiveCamera}
              className="font-display font-semibold text-sm bg-[#2C241E] text-[#FAF7F0] px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Tomar la primera foto
            </button>
          </div>
        ) : viewMode === 'stacked' ? (
          <div className="w-full flex flex-col items-center gap-5">
            <div className="w-full max-w-[320px] sm:max-w-[360px]">
              {activePhoto && (
                <PolaroidCard
                  photo={activePhoto}
                  onLike={onLikePhoto}
                  onOpenDetail={onSelectPhoto}
                  onDownloadSingle={onDownloadSinglePhoto}
                />
              )}
              {myPhotos.length > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : myPhotos.length - 1))}
                    aria-label="Anterior"
                    className="w-11 h-11 bg-[#FAF7F0] border border-[#D4C7B5] text-[#2C241E] rounded-full shadow-sm flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-ui text-xs text-[#68795A] tabular-nums">
                    {(activePhotoIndex % myPhotos.length) + 1} de {myPhotos.length}
                  </span>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev + 1) % myPhotos.length)}
                    aria-label="Siguiente"
                    className="w-11 h-11 bg-[#FAF7F0] border border-[#D4C7B5] text-[#2C241E] rounded-full shadow-sm flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {myPhotos.length > 1 && (
              <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-start gap-3 min-w-max py-2">
                  {myPhotos.map((photo, idx) => {
                    const isSelected = activePhotoIndex % myPhotos.length === idx;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => setActivePhotoIndex(idx)}
                        style={{ transform: `rotate(${photo.rotationDeg * 0.5}deg)` }}
                        className={`relative w-24 sm:w-28 p-2 pb-4 polaroid-frame transition-all cursor-pointer ${
                          isSelected ? 'scale-105 z-10' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-square overflow-hidden bg-[#CFC2AD] polaroid-photo">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="mt-1 font-ui text-[10px] text-[#2C241E] truncate text-left">{photo.formattedTime}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {myPhotos.map((photo, idx) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                index={idx}
                isStacked
                onLike={onLikePhoto}
                onOpenDetail={onSelectPhoto}
                onDownloadSingle={onDownloadSinglePhoto}
              />
            ))}
          </div>
        )}

        {/* Everyone's photos: locked until the album is revealed */}
        <button
          onClick={onOpenReveal}
          className="w-full max-w-md mt-2 text-left bg-[#FAF7F0]/80 border border-dashed border-[#D4C7B5] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#FAF7F0] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span className="shrink-0 w-11 h-11 rounded-xl bg-[#2C241E]/5 text-[#68795A] flex items-center justify-center">
            <Lock size={18} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-display font-semibold text-sm text-[#2C241E]">Todos los recuerdos del evento</span>
            <span className="block font-ui text-xs text-[#2C241E]/60 mt-0.5">
              Las fotos de los demás se revelan en {formatCountdown(timeLeft)}.
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-[#2C241E]/50" />
        </button>
      </main>

      <footer className="relative z-10 w-full py-6 pb-safe text-center border-t border-[#D4C7B5]/60 bg-[#FAF7F0]/60">
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-ui text-[11px] text-[#2C241E]/50">
            {eventConfig.title} · {eventConfig.dateOrigin}
          </span>
          <WatermarkFond size="md" variant="dark" />
        </div>
      </footer>
    </div>
  );
};
