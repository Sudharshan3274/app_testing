import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { GridBackground } from '../components/ui/GridBackground';
import { NeonButton } from '../components/ui/NeonButton';
import { ArrowRight, UserPlus } from 'lucide-react';
export function Welcome() {
  const navigate = useNavigate();
  return (
    <GridBackground>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{
            y: 30,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.6
          }}
          className="max-w-md w-full flex flex-col items-center text-center">
          
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text-cyan">
            Your AI Interview Coach
          </h1>

          <p className="text-white/60 text-lg mb-12 max-w-sm">
            Master your next interview with real-time AI feedback, tailored
            questions, and comprehensive performance analysis.
          </p>

          <div className="w-full space-y-4 flex flex-col">
            <NeonButton
              variant="primary"
              size="lg"
              fullWidth
              icon={<UserPlus size={20} />}
              onClick={() => navigate('/signup')}>
              
              Get Started
            </NeonButton>

            <NeonButton
              variant="outline"
              size="lg"
              fullWidth
              icon={<ArrowRight size={20} />}
              onClick={() => navigate('/login')}>
              
              Log In
            </NeonButton>
          </div>

          <motion.button
            whileHover={{
              scale: 1.05
            }}
            className="mt-8 text-white/40 hover:text-white/80 text-sm transition-colors"
            onClick={() => navigate('/dashboard')}>
            
            Continue as guest
          </motion.button>
        </motion.div>
      </div>
    </GridBackground>);

}