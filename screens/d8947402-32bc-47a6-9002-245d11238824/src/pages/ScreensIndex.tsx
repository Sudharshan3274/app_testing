import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { GridBackground } from '../components/ui/GridBackground';
import { GlassCard } from '../components/ui/GlassCard';
// Define all 50 screens
const screenCategories = [
{
  name: 'Authentication & Onboarding',
  screens: [
  {
    id: 1,
    name: 'Splash Screen',
    path: '/',
    built: true
  },
  {
    id: 2,
    name: 'Welcome Screen',
    path: '/welcome',
    built: true
  },
  {
    id: 3,
    name: 'Login Page',
    path: '/login',
    built: true
  },
  {
    id: 4,
    name: 'Signup Page',
    path: '/signup',
    built: true
  },
  {
    id: 5,
    name: 'Forgot Password',
    path: '#',
    built: false
  },
  {
    id: 6,
    name: 'OTP Verification',
    path: '#',
    built: false
  },
  {
    id: 7,
    name: 'Reset Password',
    path: '#',
    built: false
  }]

},
{
  name: 'Core Dashboard & Navigation',
  screens: [
  {
    id: 8,
    name: 'Home Dashboard',
    path: '/dashboard',
    built: true
  },
  {
    id: 9,
    name: 'Sidebar Navigation',
    path: '/dashboard',
    built: true
  },
  {
    id: 39,
    name: 'Global Search',
    path: '#',
    built: false
  },
  {
    id: 30,
    name: 'Notifications',
    path: '#',
    built: false
  }]

},
{
  name: 'Interview Experience',
  screens: [
  {
    id: 12,
    name: 'Interview Categories',
    path: '#',
    built: false
  },
  {
    id: 13,
    name: 'HR Interview',
    path: '#',
    built: false
  },
  {
    id: 14,
    name: 'Technical Interview',
    path: '#',
    built: false
  },
  {
    id: 15,
    name: 'Mixed Interview',
    path: '#',
    built: false
  },
  {
    id: 16,
    name: 'Live AI Interview',
    path: '/interview/live',
    built: true
  },
  {
    id: 17,
    name: 'Interview Result',
    path: '#',
    built: false
  },
  {
    id: 18,
    name: 'AI Feedback Dashboard',
    path: '#',
    built: false
  }]

},
{
  name: 'Coding Challenges',
  screens: [
  {
    id: 19,
    name: 'Challenge List',
    path: '#',
    built: false
  },
  {
    id: 20,
    name: 'Coding Editor',
    path: '#',
    built: false
  },
  {
    id: 21,
    name: 'Challenge Result',
    path: '#',
    built: false
  }]

},
{
  name: 'Resume Tools',
  screens: [
  {
    id: 22,
    name: 'Resume Upload',
    path: '#',
    built: false
  },
  {
    id: 23,
    name: 'Analysis Result',
    path: '#',
    built: false
  },
  {
    id: 24,
    name: 'Resume Builder',
    path: '#',
    built: false
  }]

},
{
  name: 'Learning & Courses',
  screens: [
  {
    id: 25,
    name: 'Courses Homepage',
    path: '#',
    built: false
  },
  {
    id: 26,
    name: 'Course Details',
    path: '#',
    built: false
  },
  {
    id: 27,
    name: 'Video Learning',
    path: '#',
    built: false
  },
  {
    id: 28,
    name: 'Quiz Screen',
    path: '#',
    built: false
  },
  {
    id: 29,
    name: 'Quiz Result',
    path: '#',
    built: false
  }]

},
{
  name: 'User Profile & Progress',
  screens: [
  {
    id: 10,
    name: 'User Profile',
    path: '#',
    built: false
  },
  {
    id: 11,
    name: 'Edit Profile',
    path: '#',
    built: false
  },
  {
    id: 31,
    name: 'Calendar Schedule',
    path: '#',
    built: false
  },
  {
    id: 32,
    name: 'Progress Tracking',
    path: '#',
    built: false
  },
  {
    id: 33,
    name: 'Leaderboard',
    path: '#',
    built: false
  },
  {
    id: 34,
    name: 'Achievements',
    path: '#',
    built: false
  },
  {
    id: 35,
    name: 'Certificates',
    path: '#',
    built: false
  }]

},
{
  name: 'Community & Support',
  screens: [
  {
    id: 36,
    name: 'Chat Support',
    path: '#',
    built: false
  },
  {
    id: 37,
    name: 'Community Discussion',
    path: '#',
    built: false
  },
  {
    id: 38,
    name: 'Blog Page',
    path: '#',
    built: false
  }]

},
{
  name: 'Settings & Payments',
  screens: [
  {
    id: 40,
    name: 'Settings',
    path: '#',
    built: false
  },
  {
    id: 41,
    name: 'Subscription Plans',
    path: '#',
    built: false
  },
  {
    id: 42,
    name: 'Payment Checkout',
    path: '#',
    built: false
  },
  {
    id: 43,
    name: 'Payment Success',
    path: '#',
    built: false
  }]

},
{
  name: 'System & Admin',
  screens: [
  {
    id: 44,
    name: 'Dark Mode UI Showcase',
    path: '#',
    built: false
  },
  {
    id: 45,
    name: 'Mobile Dashboard',
    path: '#',
    built: false
  },
  {
    id: 46,
    name: 'Admin Dashboard',
    path: '#',
    built: false
  },
  {
    id: 47,
    name: 'User Management',
    path: '#',
    built: false
  },
  {
    id: 48,
    name: 'Analytics Dashboard',
    path: '#',
    built: false
  },
  {
    id: 49,
    name: 'Error 404',
    path: '/404',
    built: true
  },
  {
    id: 50,
    name: 'Logout Confirmation',
    path: '#',
    built: false
  }]

}];

export function ScreensIndex() {
  const totalScreens = 50;
  const builtScreens = screenCategories.reduce(
    (acc, cat) => acc + cat.screens.filter((s) => s.built).length,
    0
  );
  const progress = builtScreens / totalScreens * 100;
  return (
    <GridBackground>
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex items-center gap-4 mb-4">
            
            <div className="p-3 bg-neon-cyan/10 rounded-xl text-neon-cyan">
              <Layout size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Interviu UI Kit</h1>
              <p className="text-white/60 text-lg">
                50-Screen AI Interview Platform
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              delay: 0.1
            }}>
            
            <GlassCard className="p-6 mt-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Phase 1 Progress</span>
                  <span className="text-neon-cyan font-medium">
                    {builtScreens} / {totalScreens} Screens Built
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan relative"
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: `${progress}%`
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5
                    }}>
                    
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                  </motion.div>
                </div>
              </div>
              <div className="flex gap-4 shrink-0">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-neon-cyan" />
                  <span className="text-white">Live</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-white/40" />
                  <span className="text-white/40">Coming Soon</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-12 pb-20">
          {screenCategories.map((category, catIdx) =>
          <motion.div
            key={category.name}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2 + catIdx * 0.1
            }}>
            
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                {category.name}
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.screens.map((screen) =>
              screen.built ?
              <Link key={screen.id} to={screen.path}>
                      <GlassCard
                  className="p-5 h-full border-neon-cyan/30 hover:border-neon-cyan bg-neon-cyan/[0.02] hover:bg-neon-cyan/[0.05] group transition-all cursor-pointer relative overflow-hidden"
                  hoverEffect>
                  
                        <div className="absolute top-0 right-0 w-16 h-16 bg-neon-cyan/10 blur-xl group-hover:bg-neon-cyan/20 transition-colors" />
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-mono text-neon-cyan/70">
                            #{screen.id.toString().padStart(2, '0')}
                          </span>
                          <CheckCircle2 size={18} className="text-neon-cyan" />
                        </div>
                        <h3 className="font-medium text-white group-hover:text-neon-cyan transition-colors flex items-center justify-between">
                          {screen.name}
                          <ArrowRight
                      size={16}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    
                        </h3>
                      </GlassCard>
                    </Link> :

              <GlassCard
                key={screen.id}
                className="p-5 h-full opacity-50 grayscale">
                
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-mono text-white/40">
                          #{screen.id.toString().padStart(2, '0')}
                        </span>
                        <Clock size={16} className="text-white/40" />
                      </div>
                      <h3 className="font-medium text-white/60">
                        {screen.name}
                      </h3>
                    </GlassCard>

              )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GridBackground>);

}