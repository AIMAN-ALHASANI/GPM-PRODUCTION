import React from 'react';

/**
 * GPM Logo — Clean Graduation Cap
 *
 * Props:
 *  - variant : 'full' | 'icon' | 'white'
 *  - size    : 'sm' | 'md' | 'lg'
 *  - className
 */
const Logo = ({ variant = 'full', size = 'md', className = '' }) => {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };
  const { icon: iconSize, text: textSize } = sizes[size] || sizes.md;

  const isWhite    = variant === 'white';
  const capColor   = isWhite ? '#ffffff' : '#0b84da';
  const tasselColor= isWhite ? 'rgba(255,255,255,0.75)' : '#06b6d4';
  const textColor  = isWhite ? 'text-white' : 'text-slate-900 dark:text-white';

  /* ── Clean flat graduation-cap SVG based on user's logo ── */
  const IconSVG = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top Diamond Board */}
      <polygon
        points="250,55 475,205 250,325 25,205"
        fill={capColor}
      />
      
      {/* Left/Underlapping Band */}
      <path
        d="M 120,250 C 150,285 180,310 205,330 L 205,395 C 180,375 150,350 120,315 Z"
        fill={capColor}
      />
      
      {/* Right/Overlapping Band */}
      <path
        d="M 380,250 C 340,285 280,320 225,340 L 225,405 C 280,385 340,350 380,315 Z"
        fill={capColor}
      />

      {/* Tassel line on top board */}
      <path
        d="M 250,190 L 425,230"
        stroke={isWhite ? '#0b84da' : '#ffffff'}
        strokeWidth="12"
        strokeLinecap="round"
      />
      
      {/* Hanging tassel cord */}
      <line
        x1="425" y1="230"
        x2="425" y2="380"
        stroke={capColor}
        strokeWidth="10"
      />
      
      {/* Tassel Brush (Diamond shape) */}
      <polygon
        points="425,375 405,420 425,465 445,420"
        fill={capColor}
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        <IconSVG />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <IconSVG />
      <span className={`font-black tracking-tight leading-none ${textSize} ${textColor}`}>
        GPM
      </span>
    </span>
  );
};

export default Logo;
