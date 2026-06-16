import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Video,
  BookOpen,
  FileText,
  Code2,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronLeft } from
'lucide-react';
import { Logo } from '../ui/Logo';
interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}
export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
  {
    icon: Home,
    label: 'Home',
    path: '/dashboard'
  },
  {
    icon: Video,
    label: 'Interviews',
    path: '/screens'
  },
  {
    icon: BookOpen,
    label: 'Courses',
    path: '/screens'
  },
  {
    icon: FileText,
    label: 'Resume Analysis',
    path: '/screens'
  },
  {
    icon: Code2,
    label: 'Coding Challenges',
    path: '/screens'
  },
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/screens'
  },
  {
    icon: User,
    label: 'Profile',
    path: '/screens'
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/screens'
  }];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 80 : 280
      }}
      className="h-screen sticky top-0 bg-dark-800 border-r border-white/10 flex flex-col z-40 overflow-hidden shrink-0">
      
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        {!collapsed ?
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}>
          
            <Logo size="sm" />
          </motion.div> :

        <div className="w-full flex justify-center">
            <Logo size="sm" showText={false} />
          </div>
        }
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-6 right-[-12px] bg-dark-700 border border-white/10 rounded-full p-1 text-white/50 hover:text-white z-50">
        
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        
      </button>

      <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        {menuItems.map((item) =>
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) => `
              flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 whitespace-nowrap
              ${isActive && item.path === '/dashboard' ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-white/60 hover:bg-white/5 hover:text-white'}
            `}>
          
            <item.icon size={22} className="shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <NavLink
          to="/login"
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-red-400 transition-all duration-200 whitespace-nowrap">
          
          <LogOut size={22} className="shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </NavLink>
      </div>
    </motion.aside>);

}