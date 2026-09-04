import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Hourglass } from 'lucide-react';
import { EventConfig } from '../types';
import { WatermarkFond } from './WatermarkFond';
import { formatCountdown } from './EventDashboard';

interface RevealScreenProps {
  isOpen: boolean;
  eventConfig: EventConfig;
  totalMoments: number;
  onClose: () => void;
}

/**
 * Placeholder for the shared album. Everyone's photos stay "undeveloped"
 * until the event ends; this screen explains that and shows the countdown.
 */
export const RevealScreen: React.FC<RevealScreenProps> = ({ isOpen, eventConfig, totalMoments, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(eventConfig.timeLeftSeconds);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const ghosts = [-6, 3, -2, 5, -4, 2];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper-beige paper-grain text-[#2C241E] overflow-y-auto">
      <header className="relative z-10 pt-safe px-4 flex items-center justify-between">
        <span className="font-ui text-xs text-[#5C473A]/80">{eventConfig.title}</span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="p-2 -mr-2 rounded-full text-[#3F2E24] hover:bg-[#3F2E24]/8 cursor-pointer"
        >
          <X size={22} />
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-8 gap-6">
        {/* Undeveloped prints */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          {ghosts.map((deg, i) => (
            <motion.div
              key={deg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              style={{ transform: `rotate(${deg}deg) translate(${(i - 2.5) * 6}px, ${(i % 2) * 6}px)` }}
              className="absolute inset-4 polaroid-frame p-[6%] pb-[7%]"
            >
              <div className="aspect-square bg-gradient-to-br from-[#5C473A] to-[#2C241E] polaroid-photo opacity-90" />
            </motion.div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-14 h-14 rounded-full bg-[#FAF7F0] shadow-lg flex items-center justify-center text-[#68795A]">
              <Lock size={22} />
            </span>
          </div>
        </div>

        <div className="max-w-sm flex flex-col items-center gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#3F2E24] [text-wrap:balance]">
            El álbum se está revelando
          </h1>
          <p className="font-ui text-sm text-[#5C473A]/85 leading-relaxed">
            Como en una cámara desechable, las fotos de todos los invitados permanecen en el carrete hasta que termine el
            evento. Entonces se revelarán aquí, juntas.
          </p>
        </div>

        <div className="w-full max-w-xs bg-[#FAF7F0]/80 border border-[#D4C7B5] rounded-2xl py-4 px-3 grid grid-cols-2 divide-x divide-[#D4C7B5]/60">
          <div>
            <div className="font-display text-2xl font-semibold text-[#68795A] tabular-nums flex items-center justify-center gap-1.5">
              <Hourglass size={16} />
              {formatCountdown(timeLeft)}
            </div>
            <div className="font-ui text-[10px] uppercase tracking-wider text-[#2C241E]/60 mt-0.5">Para revelar</div>
          </div>
          <div>
            <div className="font-display text-2xl font-semibold text-[#2C241E] tabular-nums">
              {totalMoments.toLocaleString('es-ES')}
            </div>
            <div className="font-ui text-[10px] uppercase tracking-wider text-[#2C241E]/60 mt-0.5">En el carrete</div>
          </div>
        </div>

        <button
          disabled
          className="font-display font-semibold text-sm bg-[#2C241E]/15 text-[#2C241E]/50 px-6 py-3 rounded-full cursor-not-allowed"
        >
          Ver todos los recuerdos · próximamente
        </button>
      </main>

      <footer className="relative z-10 pb-safe pt-4 flex justify-center">
        <WatermarkFond size="md" variant="dark" />
      </footer>
    </div>
  );
};
