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
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Zap, 
  FileText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, profile, logout, theme, toggleTheme, tasks } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hidden on landing page and login/register pages
  const noSidebarPages = ['/', '/login', '/register'];
  if (noSidebarPages.includes(pathname)) {
    return null;
  }

  // Calculate live stats from context tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate a dynamic productivity score (mock/heuristic formula based on tasks completion)
  const baseScore = totalTasks > 0 ? 60 + Math.round((completedTasks / totalTasks) * 40) : 84;
  const focusStreakBonus = Math.min(10, profile.focusStreak * 2);
  const productivityScore = isLoggedIn ? Math.min(100, baseScore + focusStreakBonus) : 0;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks & Kanban', path: '/tasks', icon: CheckSquare, badge: tasks.filter(t => !t.completed).length || undefined },
    { name: 'Schedule Calendar', path: '/calendar', icon: Calendar },
    { name: 'AI Coach Chat', path: '/chat', icon: MessageSquareCode, badge: 1 },
    { name: 'Rescue Focus Mode', path: '/focus', icon: Flame, highlight: true },
    { name: 'AI Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Daily Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = (isMobile: boolean = false) => {
    const showText = !isCollapsed || isMobile;

    return (
      <div className="flex flex-col h-full justify-between p-4">
        {/* Brand Logo & Collapse Toggle */}
        <div>
          <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-slate-200/50 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {showText && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <h1 className="font-bold text-[16px] text-slate-900 dark:text-white leading-none tracking-tight">
                    TickTock AI
                  </h1>
                  <span className="text-[9px] text-cyan-650 dark:text-accent font-mono tracking-wider font-semibold glow-text-cyan mt-0.5">
                    PRODUCTIVITY OS
                  </span>
                </motion.div>
              )}
            </Link>

            {/* Desktop Collapse Button */}
            {!isMobile && (
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer shrink-0"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
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
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-205 relative overflow-hidden ${
                    isActive 
                      ? 'text-primary dark:text-white font-semibold bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5 shadow-[0_0_15px_rgba(99,102,241,0.06)]' 
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                  } ${item.highlight ? 'border border-pink-200 dark:border-[rgba(236,72,153,0.15)] bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-950/5 dark:to-purple-950/5' : ''}`}
                >
                  {isActive && !item.highlight && (
                    <motion.div 
                      layoutId="sidebar-active-line"
                      className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={`w-[18px] h-[18px] relative z-10 transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                    isActive 
                      ? item.highlight ? 'text-danger' : 'text-primary' 
                      : item.highlight ? 'text-danger/80' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-white'
                  }`} />
                  
                  {showText && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[13px] relative z-10 truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {/* Badges */}
                  {item.badge && (
                    <span className={`ml-auto relative z-10 text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                      item.highlight 
                        ? 'bg-danger text-white' 
                        : 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {item.highlight && showText && (
                    <span className="ml-auto bg-gradient-to-r from-danger to-secondary text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold scale-90 tracking-wide uppercase shadow-sm shadow-danger/20 shrink-0">
                      SOS
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & Stats Module & Profile */}
        <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 mt-4 space-y-3">
          {/* Productivity Stats Module (Hidden if collapsed) */}
          {showText && isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-slate-900/40 space-y-2 text-[11px]"
            >
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <span>Productivity</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{productivityScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${productivityScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-400 pt-1 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-success" />
                  <span>Completion</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{completionPercentage}%</span>
              </div>
            </motion.div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-750 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)] border border-transparent transition-all text-[13px] font-semibold cursor-pointer shrink-0"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-primary shrink-0" />
                {showText && <span>Dark Theme</span>}
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-warning shrink-0" />
                {showText && <span>Light Theme</span>}
              </>
            )}
          </button>

          {/* Profile block */}
          {isLoggedIn ? (
            <div className="space-y-3">
              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors group shrink-0 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center border border-slate-200 dark:border-white/10 text-white font-bold text-xs shadow-md shrink-0">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                {showText && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {profile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {profile.email}
                    </p>
                  </motion.div>
                )}
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-550 dark:text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/10 border border-transparent transition-all text-[13px] font-medium cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {showText && <span>Log out</span>}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-xs hover:opacity-90 shadow-md shadow-primary/10 transition-all shrink-0"
              >
                <User className="w-4 h-4" />
                {showText && <span>Sign In</span>}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full h-14 glass-panel border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 fixed top-0 left-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-[15px] text-slate-900 dark:text-white">TickTock AI</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.05)] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sticky Floating Sidebar Wrapper */}
      <aside className={`hidden lg:flex flex-col sticky top-0 h-screen py-4 pl-4 shrink-0 transition-all duration-300 z-30 ${isCollapsed ? 'w-24' : 'w-68'}`}>
        <div className="h-full w-full glass-panel rounded-[24px] flex flex-col justify-between overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-100/50 dark:shadow-none">
          {SidebarContent(false)}
        </div>
      </aside>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="lg:hidden w-64 h-[calc(100vh-3.5rem)] fixed bottom-0 left-0 glass-panel border-r border-slate-200 dark:border-slate-800 z-40 pt-2"
          >
            {SidebarContent(true)}
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
