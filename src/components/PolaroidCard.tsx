import React from 'react';
import { motion } from 'motion/react';
import { EventPhoto } from '../types';
import { Heart, MapPin, Download, Maximize2 } from 'lucide-react';
import { getStyleConfig } from '../utils/filmProcessing';

interface PolaroidCardProps {
  photo: EventPhoto;
  index?: number;
  isStacked?: boolean; // kept for API compatibility: only adds a slight tilt
  onLike?: (photoId: string) => void;
  onOpenDetail?: (photo: EventPhoto) => void;
  onDownloadSingle?: (photo: EventPhoto) => void;
}

/**
 * A classic instant-film print: white frame, square photo, wide bottom band
 * with the author's name and time. No torn edges, no stacked shadows.
 */
export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  photo,
  index = 0,
  isStacked = false,
  onLike,
  onOpenDetail,
  onDownloadSingle,
}) => {
  const styleConfig = getStyleConfig(photo.style);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
      style={{ transform: isStacked ? `rotate(${(photo.rotationDeg || 0) * 0.6}deg)` : undefined }}
      className="group relative polaroid-frame p-[6%] pb-[7%] transition-transform duration-300 hover:-translate-y-1 select-none"
    >
      {/* Square photo */}
      <div
        onClick={() => onOpenDetail?.(photo)}
        className="relative aspect-square overflow-hidden bg-[#CFC2AD] polaroid-photo cursor-pointer"
      >
        <img
          src={photo.url}
          alt={photo.caption || 'Foto del evento'}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${styleConfig.filterClass}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 film-grain pointer-events-none" />

        {/* Subtle stamp in the corner of some photos */}
        {photo.tag && index % 3 === 1 && (
          <span className="absolute bottom-2 left-2 font-ui text-[10px] tracking-[0.1em] uppercase text-white mix-blend-difference opacity-85">
            {photo.tag}
          </span>
        )}

        {/* Hover quick actions */}
        <div className="absolute inset-0 bg-[#2C241E]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(photo);
            }}
            className="p-2.5 bg-[#FAF7F0] text-[#2C241E] rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Ver en grande"
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
      </div>

      {/* Bottom band */}
      <div className="pt-[7%] flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-ui text-xs sm:text-sm text-[#2C241E] truncate">
            {photo.author}
            <span className="text-[#68795A] ml-1.5 text-[11px]">{photo.formattedTime}</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(photo.id);
            }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full font-ui text-[11px] transition-all cursor-pointer ${
              photo.hasLiked ? 'text-[#B36D72]' : 'text-[#2C241E]/45 hover:text-[#B36D72]'
            }`}
            aria-label="Me gusta"
          >
            <Heart size={13} className={photo.hasLiked ? 'fill-[#B36D72]' : ''} />
            <span>{photo.likes}</span>
          </button>
        </div>

        {photo.caption ? (
          <p className="font-hand text-base sm:text-lg text-[#4A3A31] leading-tight line-clamp-1">{photo.caption}</p>
        ) : (
          <p className="font-hand text-base sm:text-lg text-[#68795A]/70 leading-tight">Momento inolvidable</p>
        )}

        {photo.location && (
          <div className="flex items-center gap-1 font-ui text-[10px] text-[#2C241E]/40">
            <MapPin size={10} />
            <span className="truncate">{photo.location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
