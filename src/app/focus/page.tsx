'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Task, SubTask } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ArrowLeft,
  X,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function FocusModePage() {
  const router = useRouter();
  const { tasks, activeFocusTaskId, setActiveFocusTaskId, updateTask, toggleSubTask, isLoggedIn } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Focus Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFocusTask, setCurrentFocusTask] = useState<Task | null>(null);

  // Sound Synthesizer States
  const [activeSound, setActiveSound] = useState<'none' | 'white' | 'rain' | 'space'>('none');
  const [volume, setVolume] = useState(0.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainNodeRef = useRef<GainNode | null>(null);

  // Load the active task
  useEffect(() => {
    if (activeFocusTaskId) {
      const task = tasks.find(t => t.id === activeFocusTaskId);
      if (task) {
        setCurrentFocusTask(task);
      }
    } else {
      // Fallback to highest priority task if none selected
      const incomplete = tasks.filter(t => !t.completed);
      if (incomplete.length > 0) {
        const sorted = [...incomplete].sort((a, b) => b.priorityScore - a.priorityScore);
        setCurrentFocusTask(sorted[0]);
        setActiveFocusTaskId(sorted[0].id);
      }
    }
  }, [activeFocusTaskId, tasks, setActiveFocusTaskId]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer completes
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#6366f1', '#a855f7', '#06b6d4'] });
    
    // Play alert sound if possible
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}

    if (!isBreak) {
      // Toggle to 5 mins break
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
      alert("Focus Session Complete! Take a 5-minute breather ☕");
    } else {
      // Back to focus
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);
      alert("Break finished! Time to lock in for another 25 minutes.");
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleTaskCheck = (subId: string) => {
    if (currentFocusTask) {
      toggleSubTask(currentFocusTask.id, subId);
    }
  };

  const handleCompleteActiveTask = () => {
    if (currentFocusTask) {
      const updated = { ...currentFocusTask, completed: true };
      updateTask(updated);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setCurrentFocusTask(null);
      setActiveFocusTaskId(null);
    }
  };

  // ==========================================
  // WEB AUDIO SYNTHESIZER (Sound Machine)
  // ==========================================
  const startSynthesizer = (type: 'white' | 'rain' | 'space') => {
    try {
      stopSynthesizer();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate White Noise Buffer
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        
        if (type === 'rain') {
          // Pink/Brownish filter for rain effect
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain boost
        } else if (type === 'space') {
          // Dark hum - low-pass filtered brown noise
          output[i] = (lastOut + (0.05 * white)) / 1.05;
          lastOut = output[i];
          output[i] *= 1.5;
        } else {
          // Pure White Noise
          output[i] = white * 0.5;
        }
      }

      // Create Buffer Node
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // Filter Node (lowpass) for space hum & rain tuning
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      if (type === 'space') {
        filter.frequency.setValueAtTime(120, ctx.currentTime); // Deep Cabin hum
      } else if (type === 'rain') {
        filter.frequency.setValueAtTime(1000, ctx.currentTime); // Soft rain
      } else {
        filter.frequency.setValueAtTime(8000, ctx.currentTime);
      }

      // Gain Node for Volume Control
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      noiseGainNodeRef.current = gainNode;

      // Pipe nodes
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Extra oscillator hum for space cabin sound
      if (type === 'space') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, ctx.currentTime); // Low hum
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
      }

      source.start();
      noiseSourceRef.current = source;
      setActiveSound(type);

    } catch (e) {
      console.error("Failed to start sound synthesizer", e);
    }
  };

  const stopSynthesizer = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setActiveSound('none');
    } catch {}
  };

  const handleSoundToggle = (soundType: 'white' | 'rain' | 'space') => {
    if (activeSound === soundType) {
      stopSynthesizer();
    } else {
      startSynthesizer(soundType);
    }
  };

  // Adjust Volume in real time
  useEffect(() => {
    if (noiseGainNodeRef.current && audioContextRef.current) {
      noiseGainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  // Clean up audio on exit
  useEffect(() => {
    return () => {
      stopSynthesizer();
    };
  }, []);

  // Compute Circular Progress SVG metrics
  const totalDuration = isBreak ? 5 * 60 : 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = ((totalDuration - currentSeconds) / totalDuration) * 100;
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`p-6 max-w-5xl mx-auto h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col items-center justify-center transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 bg-[#030309] max-w-full p-12' : ''
    }`}>
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4 mb-8 shrink-0">
        <button
          onClick={() => {
            stopSynthesizer();
            router.push('/dashboard');
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/20 border border-cyan-900/30 px-2.5 py-1 rounded-full glow-text-cyan flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Rescue Shield Active</span>
          </span>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-950/40 border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Split: Timer Left, Subtasks Right */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl overflow-y-auto">
        
        {/* Left: Pomodoro Timer */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-[220px] h-[220px] flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                className="stroke-slate-900"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Fill */}
              <motion.circle
                cx="110"
                cy="110"
                r={radius}
                className={`transition-all duration-300 ${isBreak ? 'stroke-amber-500' : 'stroke-indigo-500'}`}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Time readout overlay */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-mono text-white tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1.5 flex items-center gap-1">
                {isBreak ? (
                  <>
                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                    <span>Break Slot</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Deep Focus</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-slate-950/40 border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleStartPause}
              className={`p-5 rounded-full transition-transform hover:scale-105 shadow-lg shadow-indigo-600/10 cursor-pointer ${
                isActive ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 pl-0.5" />}
            </button>
          </div>
        </div>

        {/* Right: Task Details & Synthesizer */}
        <div className="space-y-6 flex flex-col justify-center">
          
          {/* Active Task Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(139,92,246,0.15)] bg-gradient-to-br from-indigo-950/5 to-purple-950/5">
            <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">Focus Task</span>
            
            {currentFocusTask ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-bold text-white leading-tight">{currentFocusTask.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Due date: {new Date(currentFocusTask.deadline).toLocaleDateString()}</p>
                </div>

                {/* Focus Task Checklist */}
                {currentFocusTask.subtasks && currentFocusTask.subtasks.length > 0 && (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {currentFocusTask.subtasks.map((st) => (
                      <div 
                        key={st.id}
                        className="flex items-center gap-2.5 p-1.5 rounded bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleTaskCheck(st.id)}
                          className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                        />
                        <span className={`text-[11px] ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCompleteActiveTask}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Task Completed</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                <span>No active focus task selected. Please go to </span>
                <span className="text-indigo-400 cursor-pointer font-bold hover:underline" onClick={() => router.push('/tasks')}>Task Center</span>
                <span> to queue an objective.</span>
              </div>
            )}
          </div>

          {/* Sound Machine Synth Panel */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Web Audio Sound Shield
            </h4>

            <div className="flex gap-2">
              <button
                onClick={() => handleSoundToggle('white')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  activeSound === 'white' 
                    ? 'bg-cyan-600 border-transparent text-white shadow' 
                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                White Noise
              </button>
              
              <button
                onClick={() => handleSoundToggle('rain')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  activeSound === 'rain' 
                    ? 'bg-cyan-600 border-transparent text-white shadow' 
                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Rain Storm
              </button>

              <button
                onClick={() => handleSoundToggle('space')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  activeSound === 'space' 
                    ? 'bg-cyan-600 border-transparent text-white shadow' 
                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Space Cabin
              </button>
            </div>

            {activeSound !== 'none' && (
              <div className="flex items-center gap-3">
                <Volume1 className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="0.0"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
                <Volume2 className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
