import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { GridBackground } from '../components/ui/GridBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { Logo } from '../components/ui/Logo';
export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Student');
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  return (
    <GridBackground>
      <div className="flex-1 flex items-center justify-center p-6 py-12">
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
            duration: 0.5
          }}
          className="w-full max-w-md">
          
          <div className="flex justify-center mb-8">
            <Logo size="md" />
          </div>

          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Create Account
            </h2>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={20} />
                  
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="glass-input pl-12"
                    required />
                  
                </div>
              </div>

              <div>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={20} />
                  
                  <input
                    type="email"
                    placeholder="Email address"
                    className="glass-input pl-12"
                    required />
                  
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={20} />
                  
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="glass-input pl-12 pr-12"
                    required />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                    
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                <div className="mt-2 flex gap-1 h-1">
                  <div className="flex-1 bg-neon-cyan rounded-full" />
                  <div className="flex-1 bg-neon-cyan/50 rounded-full" />
                  <div className="flex-1 bg-white/10 rounded-full" />
                  <div className="flex-1 bg-white/10 rounded-full" />
                </div>
                <p className="text-xs text-white/40 mt-1 text-right">Fair</p>
              </div>

              <div>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={20} />
                  
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="glass-input pl-12"
                    required />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  I am a:
                </label>
                <div className="flex gap-2">
                  {['Student', 'Professional', 'Recruiter'].map((r) =>
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${role === r ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}`}>
                    
                      {r}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm mt-4">
                <label className="flex items-center gap-2 cursor-pointer group mt-0.5">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded bg-white/5 group-hover:border-neon-cyan transition-colors shrink-0">
                    <input type="checkbox" className="peer sr-only" required />
                    <div className="hidden peer-checked:block w-3 h-3 bg-neon-cyan rounded-sm" />
                  </div>
                </label>
                <span className="text-white/60 leading-tight">
                  I agree to the{' '}
                  <a href="#" className="text-neon-cyan hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-neon-cyan hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </div>

              <NeonButton
                type="submit"
                fullWidth
                icon={<UserPlus size={20} />}
                className="mt-4">
                
                Sign Up
              </NeonButton>
            </form>

            <p className="mt-6 text-center text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-neon-cyan hover:text-white transition-colors font-medium">
                
                Log in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </GridBackground>);

}