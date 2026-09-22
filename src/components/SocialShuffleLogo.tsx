import React from 'react';

interface SocialShuffleLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const SocialShuffleIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Social Shuffle Logo"
    >
      {/* Top-Left: Coral Orange Quarter Wedge */}
      <path
        d="M 21.5 3.5 C 11.559 3.5 3.5 11.559 3.5 21.5 L 21.5 21.5 Z"
        fill="#FF6036"
      />

      {/* Top-Right: Mint Teal Circle Token */}
      <circle
        cx="34.5"
        cy="12.5"
        r="8.5"
        fill="#35C8A8"
      />

      {/* Bottom-Left: Violet Purple Circle Token */}
      <circle
        cx="12.5"
        cy="34.5"
        r="8.5"
        fill="#8F43EE"
      />

      {/* Bottom-Right: Marigold Yellow Quarter Wedge */}
      <path
        d="M 26.5 44.5 C 36.441 44.5 44.5 36.441 44.5 26.5 L 26.5 26.5 Z"
        fill="#FFC226"
      />
    </svg>
  );
};

export const SocialShuffleLogo: React.FC<SocialShuffleLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = true,
  className = ''
}) => {
  const iconSizes = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl'
  };

  const taglineSizes = {
    xs: 'text-[7px] tracking-[0.16em]',
    sm: 'text-[8px] tracking-[0.18em]',
    md: 'text-[9px] tracking-[0.22em]',
    lg: 'text-[11px] tracking-[0.26em]',
    xl: 'text-xs tracking-[0.28em]'
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 4-Quadrant Emblem */}
      <div className="relative flex items-center justify-center">
        <SocialShuffleIcon size={iconSizes[size]} />
      </div>

      {/* Wordmark & Tagline */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none text-left">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`${textSizes[size]} text-white font-bold tracking-tight`}
              style={{
                fontFamily: "'Pacifico', cursive, sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
            >
              Social Shuffle
            </span>
          </div>

          {showTagline && (
            <span
              className={`${taglineSizes[size]} font-extrabold uppercase text-slate-300/90 mt-1 font-sans`}
              style={{
                letterSpacing: '0.22em'
              }}
            >
              BEYOND YOUR “BORED” GAMES
            </span>
          )}
        </div>
      )}
    </div>
  );
};
