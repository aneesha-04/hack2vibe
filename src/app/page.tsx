'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  MessageSquare, 
  ArrowRight, 
  Volume2, 
  LineChart 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const getMoodCoachResponse = () => {
    switch (selectedMood) {
      case '😊':
        return "You're feeling great! Let's schedule that deep focus block. We can push through your 2.5-hour coding assignment today!";
      case '😐':
        return "Steady energy. Let's stick to the scheduled routine. I've placed a 15-minute break between your reading sessions.";
      case '😔':
        return "Low energy detected. I suggest scheduling a quick 20-minute 'win' task to build momentum. The rest can slide to tomorrow.";
      case '😫':
        return "Warning: Burnout Risk High. Let's postpone lower-priority tasks. I've rescheduled your study blocks and added recovery buffers.";
      default:
        return "Click a mood above to see how TickTock AI re-configures your schedule in real time.";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] bg-white/40 dark:bg-[#04040d]/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg leading-none bg-gradient-to-r from-slate-900 dark:from-white to-slate-700 dark:to-slate-300 bg-clip-text text-transparent">
              TickTock AI
            </span>
            <span className="block text-[9px] text-cyan-600 dark:text-cyan-400 font-mono tracking-wider glow-text-cyan">THE LIFESAVER</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-md shadow-indigo-500/10"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 flex flex-col items-center text-center max-w-5xl mx-auto z-10">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/3 w-[250px] h-[250px] bg-purple-600/10 blur-[90px] rounded-full pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 font-medium mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          The AI Productivity Assistant That Saves Your Deadlines
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-4xl"
        >
          Stop setting reminders.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Start completing tasks.
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Most apps just remind you when you are already too late. TickTock AI calculates missing-deadline risks, builds auto-scheduled time blocks, and coaches you to the finish line.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mb-16"
        >
          <Link 
            href="/register" 
            className="flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/login" 
            className="flex-1 px-6 py-3.5 text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          >
            Sign In Account
          </Link>
        </motion.div>
      </section>

      {/* Feature Demo Mockups */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Mockup Card: Risk & Score */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 md:p-8 rounded-2xl border-glow-animate"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">AI Analysis Dashboard</span>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CS-401 Final Term Presentation</h3>
            <div className="flex items-center gap-3 text-xs text-slate-555 dark:text-slate-400 mb-6">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due tomorrow, 9:00 AM</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Effort: 4 hours</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Dynamic Risk Gauge */}
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex flex-col items-center text-center">
                <ShieldAlert className="w-6 h-6 text-rose-550 dark:text-rose-500 mb-2" />
                <span className="text-2xl font-black text-rose-600 dark:text-rose-500">78%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 dark:text-rose-400">Risk of Missing</span>
              </div>

              {/* Priority Engine Score */}
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex flex-col items-center text-center">
                <Flame className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">Critical</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-500 dark:text-purple-300">Priority Level</span>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[rgba(255,255,255,0.03)] border border-slate-150 dark:border-[rgba(255,255,255,0.06)] text-xs text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
              <strong>Why?</strong> You only have 1 hour of available study slots before the deadline tomorrow, but the task requires 4 hours of estimated work. Start now to mitigate this.
            </div>

            {/* Rescue CTA */}
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-rose-500/80 to-purple-600/80 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-900/30 hover:scale-[1.02] transition-transform cursor-pointer">
              ⚠️ Trigger Emergency Rescue Plan
            </button>
          </motion.div>

          {/* Interactive Mood Adjuster Demo */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-center"
          >
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-2">Mood-Adaptive Recommendation</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How are you feeling today?</h3>
            <p className="text-slate-650 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              When stress levels spike or fatigue sets in, traditional trackers keep shouting. TickTock AI adapts. Select a mood below to see the productivity coach react.
            </p>

            <div className="flex gap-4 mb-6 justify-center">
              {['😊', '😐', '😔', '😫'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`text-3xl p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedMood === mood 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/10' 
                      : 'bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>

            {/* Coach Speech Bubble */}
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-sm leading-relaxed relative min-h-[90px] flex items-center justify-center text-center">
              <span className="absolute -top-2 left-6 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0c0a25] px-2 font-mono uppercase font-bold tracking-wider">AI Coach Feedback</span>
              <p className={selectedMood ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-500 font-medium'}>
                {getMoodCoachResponse()}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section className="bg-slate-50 dark:bg-[#050512] py-20 border-t border-b border-slate-200/60 dark:border-[rgba(255,255,255,0.03)] px-6 md:px-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Advanced AI Workload Shield</h2>
            <p className="text-slate-400 text-sm">
              We built TickTock AI around core cognitive behavioral strategies to stop procrastinating and reduce exam/project stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Priority AI score</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Calculates task criticality out of 100 based on hours required, keywords, and schedules. Provides direct logic reasoning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-650 dark:text-purple-400 mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Intelligent Auto-Scheduler</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Allocates work blocks dynamically around sleep schedules and other tasks. Draggable interface to tweak timing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-pink-500/30 dark:hover:border-pink-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-650 dark:text-pink-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Automatic Task Decomposition</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Large daunting tasks are automatically sliced into bite-sized actionable steps to reduce procrastination friction.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-650 dark:text-cyan-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Conversational Coach</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                A context-aware coach to brainstorm details, reschedule conflicts, and speak instructions via built-in voice commands.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-650 dark:text-emerald-400 mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Sound-enabled Focus Shield</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Pomodoro focus view loaded with atmospheric audio backdrops (lofi, rain) to block distractions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#09091b] border border-slate-200/50 dark:border-[rgba(255,255,255,0.05)] hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-650 dark:text-amber-400 mb-4">
                <LineChart className="w-5 h-5" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white mb-2">Burnout Analytics Tracker</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Aggregates focus hours and logs mood logs to alert you when your work velocity is creating high stress levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-[rgba(255,255,255,0.03)] bg-slate-50 dark:bg-[#03030b] transition-colors duration-300">
        <p className="mb-2 text-slate-650 dark:text-slate-500">TickTock AI © 2026 - Modern AI Productivity Assistant</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-700">Built with Next.js, Framer Motion, and Tailwind CSS v4</p>
      </footer>
    </div>
  );
}
