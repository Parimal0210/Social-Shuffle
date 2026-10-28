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
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 relative inline-flex items-center justify-center rounded-xl overflow-hidden ${className}`}
    >
      <img
        src="/assets/aistudio/social_shuffle_logo_icon.png"
        alt="Social Shuffle"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to SVG if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Precision Vector Fallback with exact logo sampled colors */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full hidden"
        aria-label="Social Shuffle Icon"
      >
        {/* Top-Left: Coral Orange Quarter Wedge */}
        <path
          d="M 21.5 3.5 C 11.559 3.5 3.5 11.559 3.5 21.5 L 21.5 21.5 Z"
          fill="#FF751F"
        />
        {/* Top-Right: Mint Teal Circle Token */}
        <circle
          cx="34.5"
          cy="12.5"
          r="8.5"
          fill="#4AB4A4"
        />
        {/* Bottom-Left: Violet Purple Circle Token */}
        <circle
          cx="12.5"
          cy="34.5"
          r="8.5"
          fill="#9440DD"
        />
        {/* Bottom-Right: Sunny Yellow Quarter Wedge */}
        <path
          d="M 26.5 44.5 C 36.441 44.5 44.5 36.441 44.5 26.5 L 26.5 26.5 Z"
          fill="#FFD230"
        />
      </svg>
    </div>
  );
};

export const SocialShuffleLogo: React.FC<SocialShuffleLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = true,
  className = ''
}) => {
  const heights = {
    xs: 'h-6',
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20'
  };

  const iconSizes = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72
  };

  const taglineSizes = {
    xs: 'text-[7px] tracking-[0.16em]',
    sm: 'text-[8px] tracking-[0.18em]',
    md: 'text-[9px] tracking-[0.20em]',
    lg: 'text-[11px] tracking-[0.24em]',
    xl: 'text-xs tracking-[0.26em]'
  };

  if (!showWordmark) {
    return <SocialShuffleIcon size={iconSizes[size]} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Uploaded Logo Image */}
      <div className="flex flex-col justify-center">
        <img
          src="/assets/aistudio/social_shuffle_logo_horizontal.png"
          alt="Social Shuffle"
          className={`${heights[size]} w-auto object-contain shrink-0 drop-shadow-sm`}
        />
        {showTagline && (
          <span
            className={`${taglineSizes[size]} font-bold uppercase text-[#94A3B8] tracking-widest pl-1 font-sans mt-0.5`}
          >
            BEYOND YOUR “BORED” GAMES
          </span>
        )}
      </div>
    </div>
  );
};
