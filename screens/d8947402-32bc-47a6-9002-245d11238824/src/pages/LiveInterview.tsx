import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  PhoneOff,
  Maximize2 } from
'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
export function LiveInterview() {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 relative z-10 bg-dark-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
            Question 3 of 10
          </div>
          <div className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            Live Analysis Active
          </div>
        </div>

        <div
          className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-white/60 hover:text-white transition-colors">
          
          Exit
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-6 gap-6 relative z-10">
        {/* Left/Center: AI Avatar & Question */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* AI Avatar */}
          <div className="relative flex items-center justify-center mb-12">
            {/* Audio Waveform Rings */}
            {[1, 2, 3].map((i) =>
            <motion.div
              key={i}
              className="absolute rounded-full border border-neon-cyan/30"
              animate={{
                width: ['200px', '300px', '200px'],
                height: ['200px', '300px', '200px'],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut'
              }} />

            )}

            {/* Core Avatar Orb */}
            <motion.div
              className="w-48 h-48 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue blur-md relative z-10 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}>
              
              <div className="w-44 h-44 rounded-full bg-dark-900 flex items-center justify-center border-2 border-neon-cyan/50">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/40 animate-pulse-slow" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Current Question */}
          <GlassCard className="w-full max-w-2xl p-8 text-center">
            <h2 className="text-2xl font-medium text-white leading-relaxed">
              "Can you describe a time when you had to design a scalable system
              under tight constraints? What trade-offs did you make?"
            </h2>
          </GlassCard>
        </div>

        {/* Right Sidebar: User Cam & Metrics */}
        <div className="w-80 flex flex-col gap-6">
          {/* User Webcam Preview */}
          <GlassCard className="aspect-video relative overflow-hidden bg-dark-800">
            {isVideoOn ?
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"
              alt="User webcam"
              className="w-full h-full object-cover opacity-80" /> :


            <div className="w-full h-full flex items-center justify-center text-white/20">
                <VideoOff size={48} />
              </div>
            }
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-medium">
              You
            </div>
            <button className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded hover:bg-black/70 transition-colors">
              <Maximize2 size={14} />
            </button>
          </GlassCard>

          {/* Live Metrics */}
          <GlassCard className="flex-1 p-5 flex flex-col">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-6">
              Live Analysis
            </h3>

            <div className="space-y-6 flex-1">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Confidence</span>
                  <span className="text-neon-cyan">82%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neon-cyan"
                    initial={{
                      width: '0%'
                    }}
                    animate={{
                      width: '82%'
                    }}
                    transition={{
                      duration: 1
                    }} />
                  
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Clarity</span>
                  <span className="text-neon-blue">91%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neon-blue"
                    initial={{
                      width: '0%'
                    }}
                    animate={{
                      width: '91%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.2
                    }} />
                  
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pace</span>
                  <span className="text-green-400">Good</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 bg-white/10 rounded-full" />
                  <div className="flex-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <div className="flex-1 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
              <span className="text-neon-cyan font-medium">Tip:</span> Try to
              maintain eye contact with the camera while explaining the
              trade-offs.
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="h-24 border-t border-white/10 bg-dark-900/80 backdrop-blur-md relative z-10 flex items-center justify-center gap-6">
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
          
          {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <div className="relative">
          {isMicOn &&
          <motion.div
            className="absolute inset-0 rounded-full bg-neon-cyan/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }} />

          }
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`relative p-6 rounded-full transition-all z-10 ${isMicOn ? 'bg-neon-cyan text-dark-900 neon-glow-cyan shadow-lg' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
            
            {isMicOn ? <Mic size={32} /> : <MicOff size={32} />}
          </button>
        </div>

        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
          <Settings size={24} />
        </button>

        <div className="w-px h-10 bg-white/10 mx-2" />

        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          
          <PhoneOff size={20} />
          End Interview
        </button>
      </footer>
    </div>);

}