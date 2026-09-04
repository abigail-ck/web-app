import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FloralTwoFlowersSvg } from './FloralArtSvg';
import { WatermarkFond } from './WatermarkFond';
import { EventConfig } from '../types';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  eventConfig: EventConfig;
  onEnter: (userName: string) => void;
  initialUserName?: string;
}

/**
 * Splash: the event photo (public/splash-bg.jpg) fills the whole screen.
 * Text sits on top of the photo over a soft cream gradient that keeps it
 * legible on any image.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ eventConfig, onEnter, initialUserName = '' }) => {
  const [userName, setUserName] = useState(initialUserName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnter(userName.trim() || 'Invitado Especial');
  };

  const letters = Array.from((eventConfig.heroWord || '').trim().toUpperCase());

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#F4F0E6] text-[#2C241E] select-none">
      {/* Full-bleed photo */}
      <img src="/splash-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 film-grain pointer-events-none" />
      {/* Legibility veils: a light wash at the top for the stamp, a stronger one at the bottom for the copy */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F4F0E6]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#F4F0E6] via-[#F4F0E6]/85 to-transparent pointer-events-none" />

      {/* Scattered letters along the right edge */}
      <div
        aria-hidden="true"
        className="absolute right-[7%] top-[12%] bottom-[46%] z-10 flex flex-col justify-between pointer-events-none font-display text-lg sm:text-xl tracking-[0.1em] text-[#3F2E24]/70"
      >
        {letters.map((ch, i) => (
          <span key={`${ch}-${i}`} className={`block leading-none ${i % 2 ? '-translate-x-4' : 'translate-x-1'}`}>
            {ch}
          </span>
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <header className="pt-safe px-6 pt-8 w-full max-w-lg mx-auto">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-ui text-[11px] tracking-[0.3em] text-[#5C473A]"
          >
            {eventConfig.dateOrigin}
          </motion.span>
        </header>

        <motion.footer
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="w-full max-w-lg mx-auto px-6 pb-safe pb-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-3">
            <FloralTwoFlowersSvg size={44} color="#5C473A" className="opacity-75" />
            <h1 className="font-display text-[1.75rem] sm:text-4xl font-medium leading-[1.12] text-[#2C241E] max-w-[18ch] [text-wrap:balance]">
              {eventConfig.welcomeTitle}
            </h1>
            <p className="font-ui text-[13px] sm:text-sm text-[#5C473A]/90 max-w-[42ch] leading-relaxed">
              {eventConfig.welcomeSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <label htmlFor="guest-name-input" className="block font-ui text-xs text-[#5C473A] mb-1.5">
              Escribe tu nombre para el cuaderno del evento
            </label>
            <div className="flex items-center gap-2 border-b border-[#3F2E24]/45 pb-1 focus-within:border-[#3F2E24]">
              <input
                id="guest-name-input"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nombre.A"
                maxLength={24}
                autoComplete="off"
                className="flex-1 min-w-0 bg-transparent font-ui text-lg text-[#2C241E] placeholder-[#3F2E24]/35 py-1.5 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Entrar"
                className="w-11 h-11 rounded-full flex items-center justify-center text-[#3F2E24] hover:bg-[#3F2E24]/8 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <WatermarkFond size="md" variant="dark" />
          </div>
        </motion.footer>
      </div>
    </div>
  );
};
