import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EventPhoto } from '../types';
import { Heart, Sparkles, MapPin, Download, Maximize2 } from 'lucide-react';
import { getStyleConfig } from '../utils/filmProcessing';

interface PolaroidCardProps {
  photo: EventPhoto;
  index?: number;
  isStacked?: boolean;
  onLike?: (photoId: string) => void;
  onOpenDetail?: (photo: EventPhoto) => void;
  onDownloadSingle?: (photo: EventPhoto) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  photo,
  index = 0,
  isStacked = false,
  onLike,
  onOpenDetail,
  onDownloadSingle,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const styleConfig = getStyleConfig(photo.style);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
      style={{
        transform: isStacked ? `rotate(${photo.rotationDeg || 0}deg)` : undefined,
      }}
      className={`group relative bg-[#FAF7F0] p-3 sm:p-4 rounded-md transition-all duration-300 ${
        isStacked
          ? 'polaroid-stacked-shadow hover:rotate-0 hover:scale-[1.02] hover:z-20'
          : 'polaroid-frame hover:shadow-xl hover:-translate-y-1'
      } border border-[#D4C7B5]/40 select-none`}
    >
      {/* Photo Frame with Film Grain & Style Filter */}
      <div
        onClick={() => onOpenDetail?.(photo)}
        className="relative aspect-[4/5] sm:aspect-[1/1] overflow-hidden rounded-[2px] bg-[#2C241E] cursor-pointer"
      >
        <img
          src={photo.url}
          alt={photo.caption || 'Event photo'}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${styleConfig.filterClass}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Film Grain Texture Overlay */}
        <div className="absolute inset-0 film-grain pointer-events-none" />

        {/* Style Badge (Small vintage stamp) */}
        <div className="absolute top-2.5 right-2.5 bg-[#2C241E]/70 backdrop-blur-sm text-[#FAF7F0] font-typewriter text-[10px] tracking-wider px-2 py-0.5 rounded uppercase border border-[#FAF7F0]/20">
          {styleConfig.badge}
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-[#2C241E]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(photo);
            }}
            className="p-2.5 bg-[#FAF7F0] text-[#2C241E] rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Agrandar foto"
          >
            <Maximize2 size={16} />
          </button>
          {onDownloadSingle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadSingle(photo);
              }}
              className="p-2.5 bg-[#FAF7F0] text-[#2C241E] rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Descargar polaroid"
            >
              <Download size={16} />
            </button>
          )}
        </div>

        {/* Optional Subtle B&W Overlay Tag */}
        {photo.tag && (
          <div className="absolute bottom-2.5 left-2.5 bg-[#FAF7F0]/90 text-[#2C241E] font-typewriter text-[10px] px-2 py-0.5 rounded shadow-sm">
            {photo.tag}
          </div>
        )}
      </div>

      {/* Bottom Polaroid Classic Note Area */}
      <div className="pt-3 sm:pt-4 pb-1 px-1 flex flex-col justify-between min-h-[70px]">
        {/* Author & Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-typewriter font-semibold text-xs sm:text-sm text-[#2C241E] tracking-tight">
              {photo.author}
            </span>
            <span className="text-[10px] font-typewriter text-[#68795A]">
              • {photo.formattedTime}
            </span>
          </div>

          {/* Heart / Like Stamp */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(photo.id);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-typewriter transition-all cursor-pointer ${
              photo.hasLiked
                ? 'text-[#B36D72] bg-[#B36D72]/10 font-bold'
                : 'text-[#2C241E]/50 hover:text-[#B36D72] hover:bg-[#B36D72]/5'
            }`}
          >
            <Heart
              size={14}
              className={`transition-transform duration-200 ${
                photo.hasLiked ? 'fill-[#B36D72] scale-110' : ''
              }`}
            />
            <span>{photo.likes}</span>
          </button>
        </div>

        {/* Handwritten / Typewriter Caption */}
        {photo.caption ? (
          <p className="font-serif-vintage italic text-xs sm:text-sm text-[#3D2B24] line-clamp-2 mt-1 leading-snug">
            &ldquo;{photo.caption}&rdquo;
          </p>
        ) : (
          <p className="font-script-hand text-lg text-[#68795A] mt-0.5">
            Momento inolvidable
          </p>
        )}

        {/* Location Subtext */}
        {photo.location && (
          <div className="flex items-center gap-1 text-[10px] font-typewriter text-[#2C241E]/40 mt-1">
            <MapPin size={10} />
            <span>{photo.location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
