import React, { useState, useEffect } from 'react';
import { Sparkles, Loader, AlertCircle, Bot, Zap, BrainCircuit, RefreshCw, Trophy, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { Habit, CompletionData, InsightData, SleepData } from '../types';
import { generateHabitInsights } from '../services/geminiService';

interface InsightsViewProps {
  habits: Habit[];
  completions: CompletionData;
  sleepData: SleepData;
}

// Map string color names to Tailwind classes
const getBadgeColor = (color: string) => {
  const map: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-500 shadow-indigo-500/20',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
    cyan: 'from-cyan-500 to-blue-500 shadow-cyan-500/20',
    purple: 'from-purple-500 to-fuchsia-500 shadow-purple-500/20',
  };
  return map[color.toLowerCase()] || map.indigo;
};

const InsightsView: React.FC<InsightsViewProps> = ({ habits, completions, sleepData }) => {
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Timer State
  const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem('habit_insights_cache');
    const lastRun = localStorage.getItem('habit_insights_last_run');
    
    if (cached && lastRun) {
      setInsightData(JSON.parse(cached));
      
      const elapsed = Date.now() - parseInt(lastRun, 10);
      if (elapsed < REFRESH_INTERVAL_MS) {
        setTimeRemaining(REFRESH_INTERVAL_MS - elapsed);
      } else {
         // Auto-refresh if stale
         handleGenerateInsights(true);
      }
    } else {
        // First run auto
        handleGenerateInsights(true);
    }
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          handleGenerateInsights(true); // Auto refresh when timer hits 0
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerateInsights = async (isAuto = false) => {
    if (habits.length === 0) {
        if (!isAuto) setError("No habits found. Add habits to generate insights.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Pass sleepData to the service
      const result = await generateHabitInsights(habits, completions, sleepData);
      setInsightData(result);
      
      // Update Cache
      localStorage.setItem('habit_insights_cache', JSON.stringify(result));
      const now = Date.now();
      localStorage.setItem('habit_insights_last_run', now.toString());
      
      // Reset Timer
      setTimeRemaining(REFRESH_INTERVAL_MS);
      
    } catch (err) {
      setError("Neural Link Failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-2xl backdrop-blur-xl transition-all duration-500 min-h-[600px] flex flex-col">
        
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>

        {/* Ambient Glows */}
        <div className="absolute -top-[200px] -right-[200px] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]"></div>

        <div className="relative z-10 p-6 sm:p-8 flex-grow flex flex-col">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                        <BrainCircuit className="h-8 w-8 text-cyan-400" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                            NEURAL<span className="text-cyan-400">.CORE</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                            <span className={loading ? "text-yellow-400 animate-pulse" : "text-emerald-400"}>
                                {loading ? "PROCESSING DATA" : "SYSTEM ONLINE"}
                            </span>
                            <span>•</span>
                            <span>GEMINI 2.5</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                     {timeRemaining > 0 && !loading && (
                        <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-2 text-sm font-mono text-cyan-300">
                            <RefreshCw className="w-3 h-3 animate-spin-slow" />
                            NEXT UPDATE: {formatTime(timeRemaining)}
                        </div>
                     )}
                     
                     <button
                        onClick={() => handleGenerateInsights(false)}
                        disabled={loading}
                        className={`
                            relative overflow-hidden rounded-lg px-6 py-3 font-bold text-white shadow-lg transition-all
                            ${loading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-cyan-500/25 active:scale-95 border border-indigo-500/50'}
                        `}
                    >
                        {loading ? 'ANALYZING...' : 'FORCE REFRESH'}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!insightData && !loading && !error && (
                <div className="flex flex-col items-center justify-center flex-grow text-center opacity-60">
                    <Bot className="mb-6 h-20 w-20 text-slate-700" strokeWidth={1} />
                    <p className="max-w-md text-slate-400 font-mono text-sm">
                        INITIALIZING NEURAL LINK... <br/>
                        WAITING FOR USER COMMAND.
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-indigo-500 rounded-full border-b-transparent animate-spin-slow"></div>
                        <Loader className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                    </div>
                    <div className="font-mono text-cyan-400 animate-pulse text-lg">CALCULATING PROBABILITIES...</div>
                </div>
            )}

            {/* Data Display */}
            {insightData && !loading && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* 1. Achievement Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {insightData.badges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className="relative group overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 transition-all hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1"
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${getBadgeColor(badge.color)} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{badge.emoji}</div>
                                    <h3 className="font-bold text-white mb-1">{badge.name}</h3>
                                    <p className="text-xs text-slate-400">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Structured Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Weekly Vibe */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Neural Vibe Check</h4>
                                    <p className="text-slate-200 font-medium leading-relaxed">
                                        "{insightData.weeklyVibe}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Winning Streak */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Top Performance</h4>
                                    <p className="text-slate-200 font-medium leading-relaxed">
                                        {insightData.winningStreak}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Room For Growth */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-rose-500/20 text-rose-400">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Optimization Needed</h4>
                                    <p className="text-slate-200 font-medium leading-relaxed">
                                        {insightData.roomForGrowth}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Smart Tip */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Tactical Advantage</h4>
                                    <p className="text-slate-200 font-medium leading-relaxed">
                                        {insightData.smartTip}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                </div>
            )}
        </div>
    </div>
  );
};

export default InsightsView;