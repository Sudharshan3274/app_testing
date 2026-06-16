import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { GridBackground } from '../components/ui/GridBackground';
import { NeonButton } from '../components/ui/NeonButton';
export function NotFound() {
  const navigate = useNavigate();
  return (
    <GridBackground>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <motion.div
          initial={{
            scale: 0.8,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.5
          }}
          className="relative">
          
          {/* Glitch Effect Text */}
          <h1 className="text-[120px] md:text-[180px] font-bold font-heading leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 relative">
            404
            <motion.span
              className="absolute inset-0 text-neon-cyan opacity-50 blur-[2px]"
              animate={{
                x: [-2, 2, -2],
                y: [1, -1, 1]
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}>
              
              404
            </motion.span>
            <motion.span
              className="absolute inset-0 text-neon-blue opacity-50 blur-[2px]"
              animate={{
                x: [2, -2, 2],
                y: [-1, 1, -1]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatType: 'reverse'
              }}>
              
              404
            </motion.span>
          </h1>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="mt-8 flex flex-col items-center">
          
          <div className="flex items-center gap-3 text-neon-cyan mb-4">
            <AlertTriangle size={24} />
            <h2 className="text-2xl font-semibold">Lost in Cyberspace</h2>
          </div>

          <p className="text-white/60 max-w-md mb-10 text-lg">
            The interview room you're looking for doesn't exist or has been
            moved to another server.
          </p>

          <NeonButton
            onClick={() => navigate('/dashboard')}
            icon={<Home size={20} />}
            size="lg">
            
            Return Home
          </NeonButton>
        </motion.div>

        {/* Floating geometric shapes for decoration */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-16 h-16 border border-neon-cyan/20 rounded-lg rotate-45"
          animate={{
            y: [-20, 20, -20],
            rotate: [45, 90, 45]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
          }} />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-neon-blue/20 rounded-full"
          animate={{
            y: [20, -20, 20],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }} />
        
      </div>
    </GridBackground>);

}