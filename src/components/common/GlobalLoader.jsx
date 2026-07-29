import React from 'react';
import Logo from '../../assets/Logo';

/**
 * GlobalLoader — Branded loading screen for GPM
 * 
 * Usage:
 *   <GlobalLoader /> — full screen overlay
 *   <GlobalLoader inline /> — inline centered loader (no overlay)
 *   <GlobalLoader message="جاري التحميل..." />
 */
const GlobalLoader = ({ inline = false, message = 'جاري التحميل...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 select-none">
      {/* Animated rings around logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div
          className="absolute rounded-full border-2 border-transparent"
          style={{
            width: 88,
            height: 88,
            background: 'conic-gradient(from 0deg, #0b84da 0%, #06b6d4 35%, transparent 60%)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)',
            animation: 'gpm-spin 1.1s linear infinite',
          }}
        />
        {/* Inner pulsing ring */}
        <div
          className="absolute rounded-full border border-primary/20"
          style={{
            width: 72,
            height: 72,
            animation: 'gpm-pulse-ring 1.8s ease-in-out infinite',
          }}
        />
        {/* Logo icon in center */}
        <div
          className="relative z-10 flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-lg"
          style={{ animation: 'gpm-float 2.5s ease-in-out infinite' }}
        >
          <Logo variant="icon" size="md" />
        </div>
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-1.5">
        <p
          className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide"
          style={{ animation: 'gpm-fade-text 1.6s ease-in-out infinite' }}
        >
          {message}
        </p>
        {/* Animated dots */}
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                animation: `gpm-dot-bounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 w-full">
        {content}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background-light dark:bg-background-dark"
      style={{ animation: 'gpm-fade-in 0.3s ease-out' }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #0b84da 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #06b6d4 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">{content}</div>
    </div>
  );
};

export default GlobalLoader;
