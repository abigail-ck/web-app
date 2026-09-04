import React from 'react';

interface FloralArtSvgProps {
  className?: string;
  size?: number;
  color?: string;
}

export const FloralTwoFlowersSvg: React.FC<FloralArtSvgProps> = ({
  className = '',
  size = 54,
  color = '#FFFFFF',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Delicate botanical single-line / silhouette two-flower illustration like image_1.png */}
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Main Central Stem */}
        <path d="M50 115 C48 90, 52 65, 48 42" />
        {/* Right branch */}
        <path d="M48 68 C58 55, 66 48, 70 36" />
        {/* Left branch */}
        <path d="M49 82 C38 72, 30 65, 26 50" />

        {/* Left Flower Petals (Stylized Alstroemeria / Blossom) */}
        <path
          d="M26 50 C22 42, 14 44, 18 36 C22 28, 28 34, 32 30 C36 26, 42 32, 38 38 C34 44, 30 46, 26 50 Z"
          fill={color}
          fillOpacity="0.85"
        />

        {/* Main/Top Flower Petals */}
        <path
          d="M48 42 C42 34, 35 30, 40 20 C45 10, 55 12, 58 6 C61 0, 70 6, 72 16 C74 26, 68 28, 66 36 C64 44, 54 44, 48 42 Z"
          fill={color}
          fillOpacity="0.9"
        />

        {/* Right Flower Petals */}
        <path
          d="M70 36 C76 30, 84 32, 82 24 C80 16, 72 20, 68 18 C64 16, 60 22, 64 28 C68 34, 70 32, 70 36 Z"
          fill={color}
          fillOpacity="0.85"
        />

        {/* Delicate Leaves */}
        <path d="M50 95 C58 92, 64 96, 68 90 C62 88, 54 90, 50 95 Z" fill={color} fillOpacity="0.6" />
        <path d="M48 80 C40 76, 34 78, 30 72 C36 72, 44 75, 48 80 Z" fill={color} fillOpacity="0.6" />
      </g>
    </svg>
  );
};

export const VintageFlourish: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#C5A059',
}) => {
  return (
    <svg
      width="120"
      height="20"
      viewBox="0 0 120 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 10 H45 M75 10 H110"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="60" cy="10" r="3" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="50" cy="10" r="1.5" fill={color} opacity="0.7" />
      <circle cx="70" cy="10" r="1.5" fill={color} opacity="0.7" />
      <path
        d="M56 10 C56 7, 64 7, 64 10 C64 13, 56 13, 56 10 Z"
        stroke={color}
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  );
};
