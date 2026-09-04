import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { PhotoStyleConfig, PhotoStyleId } from '../types';
import { PHOTO_STYLES, getStyleConfig, processImageWithStyle } from '../utils/filmProcessing';
import { soundEffects } from '../utils/audio';
import { WatermarkFond } from './WatermarkFond';

interface PhotoStyleSelectorProps {
  initialProcessedUrl: string;
  rawImageUrl: string;
  currentUser: string;
  onBack: () => void;
  onConfirm: (finalPhotoUrl: string, selectedStyle: PhotoStyleId, caption?: string) => void;
}

export const PhotoStyleSelector: React.FC<PhotoStyleSelectorProps> = ({
  initialProcessedUrl,
  rawImageUrl,
  currentUser,
  onBack,
  onConfirm,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyleId>('vintage');
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState<string>(initialProcessedUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const styleConfig = getStyleConfig(selectedStyle);

  // Helper to re-process image when user picks a different swatch
  const handleStyleChange = async (styleId: PhotoStyleId) => {
    if (styleId === selectedStyle) return;
    setSelectedStyle(styleId);
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const newUrl = await processImageWithStyle(img, styleId);
        setCurrentDisplayUrl(newUrl);
        setIsProcessing(false);
      };
      img.src = rawImageUrl;
    } catch (err) {
      console.error('Style change error:', err);
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    soundEffects.playEject();
    onConfirm(currentDisplayUrl, selectedStyle, captionText.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1916] text-[#FAF7F0] flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Navigation */}
      <header className="px-3 sm:px-8 pt-safe pb-3 flex items-center justify-between gap-2 border-b border-[#FAF7F0]/10 bg-[#1F1916]/90 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-ui text-[#FAF7F0]/80 hover:text-[#FAF7F0] p-1.5 rounded-lg hover:bg-[#FAF7F0]/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Volver a tomar</span>
        </button>

        <h1 className="font-display text-base sm:text-xl text-[#FAF7F0] font-medium truncate">
          Elige el estilo
        </h1>

        <div className="w-16 flex justify-end">
          <WatermarkFond size="sm" variant="light" />
        </div>
      </header>

      {/* Main Center Area: Stacked Polaroid Preview with Hold To Compare */}
      <main className="flex-1 min-h-0 max-w-lg w-full mx-auto px-4 py-3 sm:py-6 flex flex-col items-center justify-center">
        {/* Hold to Compare Hint */}
        {/* Polaroid Stacked Frame */}
        <div
          onMouseDown={() => setIsComparing(true)}
          onMouseUp={() => setIsComparing(false)}
          onTouchStart={() => setIsComparing(true)}
          onTouchEnd={() => setIsComparing(false)}
          style={{ width: 'min(100%, 380px, calc((100dvh - 330px) / 1.22))' }}
          className="relative polaroid-frame p-[6%] pb-[7%] cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        >
          {/* Active Comparison Badge */}
          {isComparing && (
            <div className="absolute top-6 left-6 z-30 bg-[#2C241E]/90 text-white font-ui text-[11px] px-2.5 py-1 rounded shadow-md uppercase">
              Original Sin Filtro
            </div>
          )}

          {/* Photo Display */}
          <div className="relative aspect-square w-full overflow-hidden bg-[#CFC2AD] polaroid-photo">
            <img
              src={isComparing ? rawImageUrl : currentDisplayUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Film Grain Texture if not comparing */}
            {!isComparing && (
              <div className="absolute inset-0 film-grain pointer-events-none" />
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-[#2C241E]/60 flex items-center justify-center backdrop-blur-[1px]">
                <div className="w-7 h-7 border-2 border-[#FAF7F0] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Bottom Polaroid Details */}
          <div className="pt-[7%] flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-ui text-[#2C241E]">
              <span>{currentUser}</span>
              <span className="text-[#68795A]">Mantén pulsado para comparar</span>
            </div>

            {/* Caption Input / Preview */}
            <div className="mt-1">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Dedicatoria para el reverso (opcional)"
                maxLength={140}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-full bg-transparent text-[#4A3A31] placeholder-[#2C241E]/35 font-hand text-lg px-1 py-1 border-b border-[#D4C7B5] focus:outline-none focus:border-[#68795A]"
              />
            </div>
          </div>
        </div>

        {/* Selected Style Info Card */}
        <div className="mt-3 text-center max-w-sm px-2">
          <h2 className="font-display text-lg text-[#FAF7F0] font-medium">
            {styleConfig.name}
          </h2>
          <p className="font-ui text-xs text-[#FAF7F0]/70 mt-1 leading-relaxed line-clamp-2">
            {styleConfig.description}
          </p>
        </div>
      </main>

      {/* Style Swatches & Confirm Pill Button */}
      <footer className="px-4 sm:px-8 pt-4 pb-safe bg-[#171311] border-t border-[#FAF7F0]/10 flex flex-col items-center gap-3 sm:gap-4">
        {/* Swatches: scroll on narrow screens, centered when they fit */}
        <div className="w-full max-w-lg flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {PHOTO_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`relative shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer min-w-[70px] ${
                  isSelected
                    ? 'bg-[#FAF7F0]/20 border-2 border-[#FAF7F0] scale-105'
                    : 'bg-[#FAF7F0]/5 border border-[#FAF7F0]/10 hover:bg-[#FAF7F0]/10 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Swatch Color Circle */}
                <div
                  className={`w-9 h-9 rounded-full shadow-inner flex items-center justify-center overflow-hidden ${style.filterClass}`}
                  style={{
                    backgroundColor:
                      style.id === 'vintage'
                        ? '#D4A373'
                        : style.id === 'bw'
                        ? '#555555'
                        : style.id === 'rose'
                        ? '#C48B9F'
                        : style.id === 'olive'
                        ? '#68795A'
                        : '#FAF7F0',
                  }}
                >
                  {isSelected && <Check size={14} className="text-white drop-shadow" />}
                </div>

                <span className="font-ui text-[10px] text-[#FAF7F0] whitespace-nowrap">
                  {style.badge.charAt(0) + style.badge.slice(1).toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Large White Pill Button "Guardar en el Diario" */}
        <div className="w-full max-w-xs">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#FAF7F0] text-[#1A1614] hover:bg-[#F4EFE6] active:scale-95 font-display font-medium text-base sm:text-lg py-3.5 px-6 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles size={18} className="text-[#C5A059]" />
            <span>Guardar en el Diario</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
