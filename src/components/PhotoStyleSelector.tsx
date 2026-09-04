import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Sparkles, SlidersHorizontal, Eye, MessageSquareQuote } from 'lucide-react';
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
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#FAF7F0]/10 bg-[#1F1916]/90 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-typewriter text-[#FAF7F0]/80 hover:text-[#FAF7F0] p-1.5 rounded-lg hover:bg-[#FAF7F0]/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Volver a tomar</span>
        </button>

        <h1 className="font-serif-vintage text-xl sm:text-2xl text-[#FAF7F0] font-medium tracking-wide">
          Elige el estilo de película
        </h1>

        <div className="w-16 flex justify-end">
          <WatermarkFond size="sm" variant="light" />
        </div>
      </header>

      {/* Main Center Area: Stacked Polaroid Preview with Hold To Compare */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center">
        {/* Hold to Compare Hint */}
        <div className="mb-2.5 flex items-center gap-2 text-xs font-typewriter text-[#C48B9F]">
          <Eye size={13} />
          <span>Mantén pulsada la foto para comparar con la original</span>
        </div>

        {/* Polaroid Stacked Frame */}
        <div
          onMouseDown={() => setIsComparing(true)}
          onMouseUp={() => setIsComparing(false)}
          onTouchStart={() => setIsComparing(true)}
          onTouchEnd={() => setIsComparing(false)}
          className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[#FAF7F0] p-3.5 sm:p-4 rounded-md polaroid-stacked-shadow border border-[#D4C7B5] cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        >
          {/* Active Comparison Badge */}
          {isComparing && (
            <div className="absolute top-6 left-6 z-30 bg-[#2C241E]/90 text-white font-typewriter text-[11px] px-2.5 py-1 rounded shadow-md uppercase">
              Original Sin Filtro
            </div>
          )}

          {/* Photo Display */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[#2C241E]">
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
          <div className="pt-3 pb-1 px-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-typewriter text-[#2C241E]">
              <span className="font-bold">{currentUser}</span>
              <span className="text-[#68795A]">ES.1983 • Instantánea</span>
            </div>

            {/* Caption Input / Preview */}
            <div className="mt-1">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Añadir una nota al diario (ej: Brindis bajo la pérgola)..."
                className="w-full bg-[#F4EFE6]/60 text-[#2C241E] placeholder-[#2C241E]/40 font-serif-vintage italic text-sm px-2.5 py-1.5 rounded border border-[#D4C7B5]/60 focus:outline-none focus:ring-1 focus:ring-[#68795A]"
              />
            </div>
          </div>
        </div>

        {/* Selected Style Info Card */}
        <div className="mt-4 text-center max-w-sm px-2">
          <h2 className="font-serif-vintage text-xl text-[#FAF7F0] font-semibold">
            {styleConfig.name}
          </h2>
          <p className="font-typewriter text-xs text-[#FAF7F0]/70 mt-1 leading-relaxed">
            {styleConfig.description}
          </p>
        </div>
      </main>

      {/* Style Swatches & Confirm Pill Button */}
      <footer className="px-4 sm:px-8 py-5 bg-[#171311] border-t border-[#FAF7F0]/10 flex flex-col items-center gap-4">
        {/* Swatches Horizontal Carousel */}
        <div className="w-full max-w-lg flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto pb-1">
          {PHOTO_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer min-w-[70px] ${
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

                <span className="font-typewriter text-[10px] text-[#FAF7F0] whitespace-nowrap">
                  {style.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Large White Pill Button "Guardar en el Diario" */}
        <div className="w-full max-w-xs">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#FAF7F0] text-[#1A1614] hover:bg-[#F4EFE6] active:scale-95 font-serif-vintage font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles size={18} className="text-[#C5A059]" />
            <span>Guardar en el Diario</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
