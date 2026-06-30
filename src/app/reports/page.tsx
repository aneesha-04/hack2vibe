'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { DailyReport, Task } from '../../types';
import { 
  Sparkles, 
  FileText, 
  Coffee, 
  TrendingUp, 
  CheckCircle, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ReportsPage() {
  const router = useRouter();
  const { tasks, reports, generateBriefing, generateEveningSummary, isLoggedIn } = useApp();

  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [isLoading, setIsLoading] = useState(false);
  const [historyReports, setHistoryReports] = useState<DailyReport[]>([]);

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const today = new Date().toISOString().split('T')[0];
  const activeReport = reports.find(r => r.date === today);

  // Sync reports list
  useEffect(() => {
    setHistoryReports(reports.filter(r => r.date !== today));
  }, [reports, today]);

  const handleGenerateEvening = async () => {
    setIsLoading(true);
    await generateEveningSummary(today);
    setIsLoading(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#3b82f6', '#8b5cf6'] });
  };

  const handleGenerateMorning = async () => {
    setIsLoading(true);
    await generateBriefing(today);
    setIsLoading(false);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pb-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
          AI Briefing Center
        </h2>
        <p className="text-slate-400 text-xs">
          Access automated forecast summaries and retro performance statistics compiled by the AI coach.
        </p>
      </div>

      {/* Main Switcher Tabs */}
      <div className="flex gap-4 border-b border-[rgba(255,255,255,0.05)] pb-1">
        <button
          onClick={() => setActiveTab('morning')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative cursor-pointer ${
            activeTab === 'morning' ? 'text-indigo-400 font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Morning Forecast Briefing
          {activeTab === 'morning' && (
            <motion.div layoutId="reports-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('evening')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative cursor-pointer ${
            activeTab === 'evening' ? 'text-indigo-400 font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Evening Performance Report
          {activeTab === 'evening' && (
            <motion.div layoutId="reports-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Main Report Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Report panel (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-[rgba(255,255,255,0.06)] min-h-[400px]">
            
            {activeTab === 'morning' ? (
              // MORNING VIEW
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Today's Active Forecast</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{today}</span>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span>Analyzing active priorities...</span>
                  </div>
                ) : activeReport?.morningBriefing ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">Status Overview</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] p-4 rounded-xl">
                        {activeReport.morningBriefing.overview}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Priorities */}
                      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-2">
                        <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Top Objectives</span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {activeReport.morningBriefing.priorities.map((item, index) => (
                            <li key={index} className="flex gap-2 items-start">
                              <span className="text-cyan-400 font-mono">0{index + 1}.</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggestions */}
                      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-2">
                        <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">Productivity Advice</span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {activeReport.morningBriefing.suggestions.map((item, index) => (
                            <li key={index} className="flex gap-2 items-start">
                              <span className="text-purple-400 font-mono">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {activeReport.morningBriefing.risks && activeReport.morningBriefing.risks.length > 0 && (
                      <div className="p-4 bg-rose-950/10 border border-rose-900/30 rounded-xl space-y-2 text-xs text-rose-400">
                        <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Threat Warning Alerts
                        </span>
                        <ul className="space-y-1 pl-4 list-disc text-[11px] leading-relaxed">
                          {activeReport.morningBriefing.risks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <FileText className="w-12 h-12 text-slate-700" />
                    <div>
                      <p className="text-slate-400 text-xs font-medium">Morning planning forecast is not compiled.</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">Click build below to analyze today's calendar commitments.</p>
                    </div>
                    <button
                      onClick={handleGenerateMorning}
                      className="px-4 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Build Morning Forecast
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // EVENING VIEW
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Daily Retrospective summary</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{today}</span>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span>Compiling completed milestones...</span>
                  </div>
                ) : activeReport?.eveningReport ? (
                  <div className="space-y-6">
                    {/* Performance metrics breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl text-center">
                        <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Productivity Score</span>
                        <span className="text-2xl font-black text-white">{activeReport.eveningReport.productivityScore}/100</span>
                      </div>

                      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl text-center">
                        <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Tasks Completed</span>
                        <span className="text-2xl font-black text-white">{activeReport.eveningReport.completedCount}</span>
                      </div>

                      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl text-center">
                        <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Focus Hours Logged</span>
                        <span className="text-2xl font-black text-white">{activeReport.eveningReport.timeSpent}h</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">Performance analysis</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] p-4 rounded-xl">
                        {activeReport.eveningReport.summary}
                      </p>
                    </div>

                    {activeReport.eveningReport.suggestionsTomorrow && activeReport.eveningReport.suggestionsTomorrow.length > 0 && (
                      <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-xl space-y-2 text-xs text-indigo-300">
                        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Re-alignment Guidelines for tomorrow</span>
                        <ul className="space-y-1 pl-4 list-disc text-[11px] leading-relaxed">
                          {activeReport.eveningReport.suggestionsTomorrow.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <Award className="w-12 h-12 text-slate-700" />
                    <div>
                      <p className="text-slate-400 text-xs font-medium">Evening performance evaluation is not compiled.</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">Click calculate below to check today's completed milestones and habits.</p>
                    </div>
                    <button
                      onClick={handleGenerateEvening}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow shadow-indigo-500/10 cursor-pointer"
                    >
                      Compile Evening Report
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Historical Reports Archive */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] min-h-[400px]">
            <h3 className="font-bold text-sm text-white border-b border-[rgba(255,255,255,0.05)] pb-4 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Reports Archive
            </h3>

            {historyReports.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-600">
                Reports folder is empty. Previous briefings will be archived here.
              </div>
            ) : (
              <div className="space-y-3">
                {historyReports.map((report) => (
                  <div 
                    key={report.date}
                    className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] hover:border-indigo-500/10 rounded-xl flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      // Switch active display or load archive
                      alert(`Showing archive for ${report.date}:\n\nProductivity Score: ${report.eveningReport?.productivityScore || 'Not completed'}\nMorning Overview: ${report.morningBriefing?.overview || 'Not run'}`);
                    }}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white">{report.date}</h4>
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        {report.eveningReport ? `Score: ${report.eveningReport.productivityScore}/100` : 'Only morning briefing run'}
                      </span>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Chevron helper
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
