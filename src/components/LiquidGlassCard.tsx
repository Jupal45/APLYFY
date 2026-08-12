import React from 'react';
import { motion } from 'motion/react';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'sky' | 'indigo' | 'cyan' | 'white';
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  glowColor = 'white',
  hoverEffect = false,
  onClick,
}) => {
  const glowStyles = {
    white: 'shadow-2xl border-white/30',
    sky: 'shadow-2xl border-sky-200/40 shadow-sky-500/10',
    indigo: 'shadow-2xl border-indigo-200/40 shadow-indigo-500/10',
    cyan: 'shadow-2xl border-cyan-200/40 shadow-cyan-500/10',
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { scale: 1.01, y: -2 } : undefined}
      whileTap={hoverEffect ? { scale: 0.99 } : undefined}
      className={`
        relative overflow-hidden rounded-[2.5rem]
        bg-white/20 dark:bg-slate-900/40
        backdrop-blur-3xl
        border border-white/30 border-t-white/60 border-l-white/50
        ${glowStyles[glowColor]}
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top Frosted Glass Reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-[2.5rem]" />
      
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
