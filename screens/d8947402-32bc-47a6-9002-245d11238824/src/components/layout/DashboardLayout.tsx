import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';
export function DashboardLayout({ children }: {children: React.ReactNode;}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-dark-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18} />
              
              <input
                type="text"
                placeholder="Search interviews, courses..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all" />
              
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-white/40">Pro Member</p>
              </div>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=00D4FF"
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-neon-cyan/50" />
              
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>);

}