import React from 'react';
import { motion } from 'framer-motion';
interface NeonButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
export function NeonButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  ...props
}: NeonButtonProps) {
  const baseClasses =
  'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 overflow-hidden';
  const variants = {
    primary:
    'bg-neon-cyan text-dark-900 hover:bg-white neon-glow-cyan font-semibold',
    outline:
    'bg-transparent border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return (
    <motion.button
      whileHover={{
        scale: 1.02
      }}
      whileTap={{
        scale: 0.98
      }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}>
      
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {variant === 'primary' &&
      <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-out" />
      }
    </motion.button>);

}