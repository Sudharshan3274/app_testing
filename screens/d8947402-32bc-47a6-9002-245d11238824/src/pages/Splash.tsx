import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { GridBackground } from '../components/ui/GridBackground';
export function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <GridBackground>
      <div className="flex-1 flex flex-col items-center justify-center">
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
            duration: 0.8,
            ease: 'easeOut'
          }}
          className="flex flex-col items-center">
          
          <motion.div
            animate={{
              boxShadow: [
              '0 0 0px rgba(0,212,255,0)',
              '0 0 40px rgba(0,212,255,0.4)',
              '0 0 0px rgba(0,212,255,0)']

            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="rounded-full p-4 mb-6">
            
            <Logo size="xl" />
          </motion.div>

          <motion.p
            initial={{
              y: 20,
              opacity: 0
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            transition={{
              delay: 0.5,
              duration: 0.5
            }}
            className="text-white/70 text-xl font-medium tracking-wide">
            
            Ace Your Interviews with AI
          </motion.p>
        </motion.div>

        <motion.div
          className="absolute bottom-12 flex gap-2"
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 1
          }}>
          
          {[0, 1, 2].map((i) =>
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-neon-cyan"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15
            }} />

          )}
        </motion.div>
      </div>
    </GridBackground>);

}