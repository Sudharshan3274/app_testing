import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Github, Linkedin, LogIn } from 'lucide-react';
import { GridBackground } from '../components/ui/GridBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { Logo } from '../components/ui/Logo';
export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  return (
    <GridBackground>
      <div className="flex-1 flex items-center justify-center p-6">
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
              Welcome Back
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
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
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded bg-white/5 group-hover:border-neon-cyan transition-colors">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="hidden peer-checked:block w-3 h-3 bg-neon-cyan rounded-sm" />
                  </div>
                  <span className="text-white/70 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-neon-cyan hover:text-white transition-colors">
                  
                  Forgot password?
                </a>
              </div>

              <NeonButton
                type="submit"
                fullWidth
                icon={<LogIn size={20} />}
                className="mt-2">
                
                Log In
              </NeonButton>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/40 text-sm">or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  
                </svg>
              </button>
              <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                <Github className="w-6 h-6" />
              </button>
              <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                <Linkedin className="w-6 h-6" />
              </button>
            </div>

            <p className="mt-8 text-center text-white/60 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-neon-cyan hover:text-white transition-colors font-medium">
                
                Sign up
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </GridBackground>);

}