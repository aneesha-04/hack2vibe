'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BarChart2, 
  MessageSquareCode, 
  Flame, 
  Compass, 
  Settings, 
  User, 
  LogOut, 
  Activity, 
  Menu, 
  X, 
  Zap, 
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, profile, logout, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Hidden on landing page and login/register pages to allow full page layouts
  const noSidebarPages = ['/', '/login', '/register'];
  if (noSidebarPages.includes(pathname)) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks & Kanban', path: '/tasks', icon: CheckSquare },
    { name: 'Schedule Calendar', path: '/calendar', icon: Calendar },
    { name: 'AI Coach Chat', path: '/chat', icon: MessageSquareCode },
    { name: 'Rescue Focus Mode', path: '/focus', icon: Flame, highlight: true },
    { name: 'AI Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Daily Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Brand Logo */}
      <div>
        <div className="flex items-center gap-2 px-2 py-3 mb-6 border-b border-slate-200 dark:border-[rgba(255,255,255,0.08)]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-none">
              LastMinute AI
            </h1>
            <span className="text-[10px] text-cyan-500 dark:text-cyan-400 font-mono tracking-wider font-semibold glow-text-cyan">
              LIFESAVER MVP
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive 
                    ? 'text-indigo-600 dark:text-white font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)]'
                } ${item.highlight ? 'border border-pink-200 dark:border-[rgba(236,72,153,0.2)] bg-gradient-to-r from-pink-500/5 dark:from-purple-950/20 to-pink-500/10 dark:to-pink-950/20' : ''}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 dark:from-indigo-600/20 via-purple-500/5 dark:via-purple-600/10 to-transparent border-l-2 border-indigo-650 dark:border-indigo-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                  isActive 
                    ? item.highlight ? 'text-pink-550 dark:text-pink-400' : 'text-indigo-600 dark:text-indigo-400' 
                    : item.highlight ? 'text-pink-500/70 group-hover:text-pink-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-slate-200'
                }`} />
                
                <span className="text-sm font-medium relative z-10">
                  {item.name}
                </span>

                {item.highlight && (
                  <span className="ml-auto bg-gradient-to-r from-pink-500 to-purple-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold scale-90 tracking-wide glow-pink uppercase">
                    SOS
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & User Profile Section */}
      <div className="border-t border-slate-200 dark:border-[rgba(255,255,255,0.08)] pt-4 mt-4 space-y-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)] border border-transparent transition-all text-sm font-medium cursor-pointer"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-650" />
              <span>Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-450" />
              <span>Light Theme</span>
            </>
          )}
        </button>

        {isLoggedIn ? (
          <div className="space-y-3">
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center border border-slate-200 dark:border-[rgba(255,255,255,0.1)] text-white font-bold text-sm shadow-md">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {profile.name}
                </p>
                <p className="text-[11px] text-slate-550 dark:text-slate-500 truncate">
                  {profile.email}
                </p>
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 dark:hover:border-rose-900/30 border border-transparent transition-all text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/10 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full h-14 glass-panel border-b border-slate-200 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between px-4 fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-md text-slate-900 dark:text-white">LastMinute AI</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.05)] text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 left-0 border-r border-slate-200 dark:border-[rgba(139,92,246,0.1)] glass-panel z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="lg:hidden w-64 h-[calc(100vh-3.5rem)] fixed bottom-0 left-0 glass-panel border-r border-slate-200 dark:border-[rgba(139,92,246,0.15)] z-40 pt-2"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Dim backdrop when mobile menu is open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden fixed inset-0 bg-black/40 z-30 pt-14"
        />
      )}
    </>
  );
};
