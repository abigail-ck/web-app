import React from 'react';

interface WatermarkFondProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'gold';
}

export const WatermarkFond: React.FC<WatermarkFondProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
}) => {
  const sizeClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-4xl tracking-widest',
  };

  const colorClasses = {
    dark: 'text-[#2C241E]/40 hover:text-[#2C241E]/70',
    light: 'text-[#FBF9F4]/60 hover:text-[#FBF9F4]/90',
    gold: 'text-[#C5A059]/60 hover:text-[#C5A059]/90',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-serif-vintage lowercase select-none transition-colors duration-300 font-bold ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
      style={{
        textShadow: variant === 'light' ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 1px rgba(255,255,255,0.6)',
      }}
    >
      <span className="relative">
        fond
        <span className="absolute -bottom-0.5 left-0 right-0 h-[0.5px] bg-current opacity-30"></span>
      </span>
    </div>
  );
};
