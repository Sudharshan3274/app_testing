import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}
export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: {
      icon: 20,
      text: 'text-lg'
    },
    md: {
      icon: 28,
      text: 'text-2xl'
    },
    lg: {
      icon: 40,
      text: 'text-4xl'
    },
    xl: {
      icon: 64,
      text: 'text-6xl'
    }
  };
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="relative flex items-center justify-center"
        whileHover={{
          scale: 1.05
        }}
        whileTap={{
          scale: 0.95
        }}>
        
        <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full" />
        <BrainCircuit
          size={sizes[size].icon}
          className="text-neon-cyan relative z-10 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        
      </motion.div>
      {showText &&
      <span
        className={`font-heading font-bold text-white tracking-tight ${sizes[size].text}`}>
        
          Interviu
        </span>
      }
    </div>);

}