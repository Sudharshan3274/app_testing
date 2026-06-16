import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}
export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      whileHover={
      hoverEffect ?
      {
        y: -5,
        backgroundColor: 'rgba(255,255,255,0.05)'
      } :
      {}
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      {...props}>
      
      {children}
    </motion.div>);

}