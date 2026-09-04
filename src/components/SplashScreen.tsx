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
 * Splash: grainy beige paper, a framed close-up photo with the letters of
 * `heroWord` scattered over it, the welcome line and a minimal name field.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  eventConfig,
  onEnter,
  initialUserName = '',
}) => {
  const [userName, setUserName] = useState(initialUserName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnter(userName.trim() || 'Invitado Especial');
  };

  const letters = Array.from((eventConfig.heroWord || '').trim().toUpperCase());

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-paper-beige paper-grain text-[#2C241E] select-none">
      {/* Top bar: origin stamp */}
      <header className="relative z-10 pt-8 sm:pt-10 w-full max-w-lg px-6 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif-vintage text-xs sm:text-sm tracking-[0.3em] text-[#5C473A]"
        >
          {eventConfig.dateOrigin}
        </motion.span>
      </header>

      {/* Center: framed photo with scattered letters, line art and welcome */}
      <main className="relative z-10 w-full max-w-lg px-6 py-4 flex flex-col items-center text-center gap-5">
        <motion.figure
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative m-0 w-[62vw] max-w-[300px] aspect-[3/4] overflow-hidden shadow-[0_1px_2px_rgba(44,36,30,0.12),0_14px_34px_rgba(44,36,30,0.14)]"
        >
          <img
            src="/anthurium.svg"
            alt=""
            className="w-full h-full object-cover filter saturate-[0.85] contrast-[0.92] brightness-[1.03]"
          />
          <div className="absolute inset-0 film-grain pointer-events-none" />
          {/* Scattered letters, alternating left / right like a typeset poem */}
          <div
            aria-hidden="true"
            className="absolute inset-[10%_14%] z-20 flex flex-col justify-between pointer-events-none font-serif-vintage text-xl sm:text-2xl tracking-[0.08em] text-[#FFFAF4]/95 [text-shadow:0_0_6px_rgba(120,60,60,0.25)]"
          >
            {letters.map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={`block leading-none ${
                  i % 3 === 2 ? 'text-center pr-[6%]' : i % 2 === 0 ? 'text-right pr-[12%]' : 'text-left pl-[18%]'
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
        </motion.figure>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <FloralTwoFlowersSvg size={54} color="#5C473A" className="opacity-80" />
          <h1 className="font-serif-vintage text-3xl sm:text-4xl font-medium leading-tight text-[#3F2E24] max-w-[20ch] [text-wrap:balance]">
            {eventConfig.welcomeTitle}
          </h1>
          <p className="font-ui text-xs sm:text-sm text-[#5C473A]/80 max-w-sm leading-relaxed">
            {eventConfig.welcomeSubtitle}
          </p>
        </motion.div>
      </main>

      {/* Name form + watermark */}
      <footer className="relative z-10 w-full max-w-lg px-6 pb-8 flex flex-col gap-8">
        <form onSubmit={handleSubmit} className="w-full">
          <label htmlFor="guest-name-input" className="block font-ui text-sm text-[#5C473A] mb-2">
            Escribe tu nombre para el cuaderno del evento:
          </label>
          <div className="flex items-center gap-2 border-b border-[#3F2E24]/40 pb-1.5 focus-within:border-[#3F2E24]">
            <input
              id="guest-name-input"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nombre.A"
              maxLength={24}
              className="flex-1 min-w-0 bg-transparent font-ui text-lg text-[#2C241E] placeholder-[#3F2E24]/35 py-1.5 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              aria-label="Entrar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#3F2E24] hover:bg-[#3F2E24]/8 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap font-ui text-[11px] text-[#5C473A]/70">
            <span>Sugerencias:</span>
            {['Emma.D', 'Daniel.M', 'Brian.S', 'Yen.K'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setUserName(name);
                  onEnter(name);
                }}
                className="underline underline-offset-2 hover:text-[#3F2E24] cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex justify-center"
        >
          <WatermarkFond size="lg" variant="dark" />
        </motion.div>
      </footer>
    </div>
  );
};
