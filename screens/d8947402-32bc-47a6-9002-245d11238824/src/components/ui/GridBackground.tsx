import React from 'react';
import { motion } from 'framer-motion';
export function GridBackground({ children }: {children: React.ReactNode;}) {
  return (
    <div className="relative min-h-screen w-full bg-dark-900 overflow-hidden flex flex-col">
      {/* Animated Orbs */}
      <motion.div
        className="gradient-orb bg-neon-blue w-[500px] h-[500px] top-[-100px] left-[-100px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }} />
      
      <motion.div
        className="gradient-orb bg-neon-cyan w-[400px] h-[400px] bottom-[-50px] right-[-50px]"
        animate={{
          x: [0, -40, 0],
          y: [0, -40, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }} />
      
      <motion.div
        className="gradient-orb bg-neon-violet/30 w-[600px] h-[600px] top-[20%] left-[30%]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }} />
      

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>);

}