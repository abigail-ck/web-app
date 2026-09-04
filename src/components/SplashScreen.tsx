import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FloralTwoFlowersSvg } from './FloralArtSvg';
import { WatermarkFond } from './WatermarkFond';
import { EventConfig } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  eventConfig: EventConfig;
  onEnter: (userName: string) => void;
  initialUserName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  eventConfig,
  onEnter,
  initialUserName = '',
}) => {
  const [userName, setUserName] = useState(initialUserName);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      onEnter(userName.trim());
    } else {
      onEnter('Invitado Especial');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-[#2C241E] text-[#FBF9F4] select-none">
      {/* Background: Detailed close-up macro of an Alstroemeria / Warm Botanical Flower with film grain */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1920&q=85"
          alt="Jardín de Recuerdos Botanical Flower"
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.1] saturate-[1.25] sepia-[0.18]"
          referrerPolicy="no-referrer"
        />
        {/* Warm Vintage Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C241E]/60 via-[#2C241E]/40 to-[#2C241E]/80 mix-blend-multiply" />
        {/* Vintage Film Grain */}
        <div className="absolute inset-0 film-grain pointer-events-none" />
      </div>

      {/* Top Bar: Date / Origin "ES.1983" */}
      <header className="relative z-10 pt-8 sm:pt-12 text-center w-full max-w-xl px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-xs sm:text-sm tracking-[0.35em] uppercase font-typewriter text-[#FAF7F0]/80"
        >
          {eventConfig.dateOrigin}
        </motion.div>
      </header>

      {/* Center Hero Card & Name Input Form */}
      <main className="relative z-10 w-full max-w-lg px-6 py-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="flex flex-col items-center w-full"
        >
          {/* Delicate Two-Flowers Line Art Drawing */}
          <div className="mb-4 sm:mb-6 p-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <FloralTwoFlowersSvg size={58} color="#FAF7F0" />
          </div>

          {/* Welcome Title */}
          <h1 className="font-serif-vintage text-3xl sm:text-4xl md:text-5xl font-normal leading-tight tracking-wide text-[#FAF7F0] mb-3 sm:mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {eventConfig.welcomeTitle}
          </h1>

          {/* Subtitle Message */}
          <p className="font-serif-vintage text-xs sm:text-sm tracking-widest uppercase text-[#FAF7F0]/80 max-w-md mx-auto leading-relaxed mb-8 px-2">
            {eventConfig.welcomeSubtitle}
          </p>

          {/* Minimalist Name Input Box */}
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#FAF7F0]/15 backdrop-blur-md border border-[#FAF7F0]/30 rounded-2xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-[#FAF7F0]/50"
          >
            <label
              htmlFor="guest-name-input"
              className="block font-serif-vintage text-base sm:text-lg italic text-[#FAF7F0]/90 mb-3 text-center"
            >
              Introduce tu nombre para el diario del evento:
            </label>

            <div className="relative flex flex-col sm:flex-row gap-2.5 items-stretch">
              <input
                id="guest-name-input"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: Brian.S, Yen.K, Camila..."
                className="w-full bg-[#FAF7F0]/90 text-[#2C241E] placeholder-[#2C241E]/40 font-typewriter text-sm sm:text-base px-4 py-3 rounded-xl border border-[#D4C7B5] focus:outline-none focus:ring-2 focus:ring-[#C48B9F] transition-all shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="whitespace-nowrap bg-[#FAF7F0] text-[#2C241E] hover:bg-[#F4EFE6] active:scale-95 font-serif-vintage font-semibold text-base sm:text-lg px-6 py-3 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Entrar</span>
                <ArrowRight
                  size={18}
                  className={`transition-transform duration-200 ${
                    isHovered ? 'translate-x-1' : ''
                  }`}
                />
              </button>
            </div>

            {/* Quick Guest Suggestions */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-[#FAF7F0]/70 font-typewriter">
              <span>Invitados sugeridos:</span>
              {['Emma.D', 'Daniel.M', 'Brian.S', 'Yen.K'].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setUserName(name);
                    onEnter(name);
                  }}
                  className="hover:text-[#FAF7F0] underline cursor-pointer hover:bg-[#FAF7F0]/10 px-1.5 py-0.5 rounded"
                >
                  {name}
                </button>
              ))}
            </div>
          </form>
        </motion.div>
      </main>

      {/* Footer: Linen Watermark 'fond' */}
      <footer className="relative z-10 pb-8 text-center w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="flex items-center gap-2 text-xs tracking-widest text-[#FAF7F0]/60 font-typewriter">
            <Sparkles size={12} />
            <span>DIARIO ANALÓGICO DE EVENTOS</span>
            <Sparkles size={12} />
          </div>
          <WatermarkFond size="lg" variant="light" />
        </motion.div>
      </footer>
    </div>
  );
};
