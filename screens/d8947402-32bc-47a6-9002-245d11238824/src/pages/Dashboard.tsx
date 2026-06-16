import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Target,
  Flame,
  Clock,
  Users,
  Code2,
  BrainCircuit,
  Briefcase,
  MessageSquare,
  Play,
  Calendar,
  ChevronRight,
  Sparkles } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
const chartData = [
{
  name: 'Mon',
  score: 65
},
{
  name: 'Tue',
  score: 72
},
{
  name: 'Wed',
  score: 68
},
{
  name: 'Thu',
  score: 85
},
{
  name: 'Fri',
  score: 82
},
{
  name: 'Sat',
  score: 90
},
{
  name: 'Sun',
  score: 94
}];

const stats = [
{
  label: 'Interviews Taken',
  value: '24',
  icon: Video,
  trend: '+3 this week',
  color: 'text-neon-cyan'
},
{
  label: 'Avg Score',
  value: '86%',
  icon: Target,
  trend: '+5% vs last month',
  color: 'text-neon-blue'
},
{
  label: 'Coding Streak',
  value: '12',
  icon: Flame,
  trend: 'Days',
  color: 'text-orange-400'
},
{
  label: 'Hours Practiced',
  value: '48.5',
  icon: Clock,
  trend: 'Top 10%',
  color: 'text-neon-violet'
}];

const categories = [
{
  name: 'HR',
  icon: Users,
  color: 'bg-blue-500/10 text-blue-400'
},
{
  name: 'Technical',
  icon: Code2,
  color: 'bg-neon-cyan/10 text-neon-cyan'
},
{
  name: 'Aptitude',
  icon: BrainCircuit,
  color: 'bg-purple-500/10 text-purple-400'
},
{
  name: 'Mixed',
  icon: Briefcase,
  color: 'bg-orange-500/10 text-orange-400'
},
{
  name: 'Group',
  icon: MessageSquare,
  color: 'bg-green-500/10 text-green-400'
}];

const schedule = [
{
  title: 'Mock Technical Interview',
  date: 'Today, 2:00 PM',
  type: 'Technical',
  status: 'upcoming'
},
{
  title: 'HR Round Practice',
  date: 'Tomorrow, 11:00 AM',
  type: 'HR',
  status: 'scheduled'
},
{
  title: 'System Design',
  date: 'Fri, 4:00 PM',
  type: 'Technical',
  status: 'scheduled'
}];

export function Dashboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, Alex
            </h1>
            <p className="text-white/60">
              Your interview readiness score is improving. Keep it up!
            </p>
          </div>
          <NeonButton
            onClick={() => navigate('/interview/live')}
            icon={<Play size={18} />}>
            
            Start Quick Interview
          </NeonButton>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) =>
          <motion.div
            key={stat.label}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.1
            }}>
            
              <GlassCard className="p-6" hoverEffect>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-md">
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-white/60">{stat.label}</p>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.4
            }}
            className="lg:col-span-1">
            
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Continue Practice</h2>
                <button className="text-sm text-neon-cyan hover:text-white transition-colors">
                  View all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) =>
                <button
                  key={cat.name}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                  
                    <div
                    className={`p-3 rounded-full mb-3 ${cat.color} group-hover:scale-110 transition-transform`}>
                    
                      <cat.icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-white/80">
                      {cat.name}
                    </span>
                  </button>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.5
            }}
            className="lg:col-span-2">
            
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Performance Trend
                  </h2>
                  <p className="text-sm text-white/40">Last 7 sessions</p>
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-neon-cyan">
                  <option>Overall Score</option>
                  <option>Technical</option>
                  <option>Communication</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 5,
                      left: -20,
                      bottom: 0
                    }}>
                    
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false} />
                    
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false} />
                    
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false} />
                    
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0e27',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      itemStyle={{
                        color: '#00D4FF'
                      }} />
                    
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#00D4FF"
                      strokeWidth={3}
                      dot={{
                        fill: '#000',
                        stroke: '#00D4FF',
                        strokeWidth: 2,
                        r: 4
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#00D4FF',
                        stroke: '#fff'
                      }}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))'
                      }} />
                    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.6
            }}>
            
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar size={20} className="text-neon-cyan" />
                  Upcoming Schedule
                </h2>
                <button className="text-sm text-white/40 hover:text-white transition-colors">
                  Manage
                </button>
              </div>
              <div className="space-y-4">
                {schedule.map((item, i) =>
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-12 rounded-full bg-neon-cyan/50" />
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-white/50">
                          {item.date} • {item.type}
                        </p>
                      </div>
                    </div>
                    {item.status === 'upcoming' ?
                  <NeonButton
                    size="sm"
                    onClick={() => navigate('/interview/live')}>
                    
                        Join
                      </NeonButton> :

                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                      </button>
                  }
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.7
            }}>
            
            <GlassCard className="p-6 h-full bg-gradient-to-br from-white/[0.03] to-neon-cyan/[0.05]">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-neon-cyan" />
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white mb-2">
                    Focus on System Design
                  </h4>
                  <p className="text-sm text-white/60 mb-3">
                    Your last technical interview showed a 15% drop in system
                    design questions. We recommend taking a quick refresher
                    course.
                  </p>
                  <button className="text-sm text-neon-cyan hover:text-white font-medium transition-colors">
                    Start Course →
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white mb-2">
                    Pacing is perfect
                  </h4>
                  <p className="text-sm text-white/60">
                    Your speaking pace has stabilized at 140 wpm. Keep this up
                    for your upcoming HR rounds.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>);

}