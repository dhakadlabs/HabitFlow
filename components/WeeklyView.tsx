import React, { useMemo, useState, useEffect } from 'react';
import { Check, Circle, ChevronLeft, ChevronRight, Quote, CalendarDays, Sparkles, Lock, CloudMoon, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Habit, CompletionData, SleepData } from '../types';
import { formatDate, getWeekDays, QUOTES } from '../utils';
import { generateDailyTip } from '../services/geminiService';

// --- Flip Clock Components ---

const FlipCard: React.FC<{ value: string | number; label?: string; size?: 'normal' | 'small' }> = ({ 
  value, 
  label, 
  size = 'normal' 
}) => {
  const formattedValue = String(value).padStart(2, '0');
  
  return (
    <div className="flex flex-col items-center mx-1">
      <div 
        className={`
          relative bg-slate-800 rounded-lg shadow-lg border-b-4 border-slate-900 overflow-hidden flex justify-center items-center font-mono text-white leading-none
          ${size === 'small' ? 'w-8 h-10 text-xl' : 'w-10 h-12 text-3xl sm:w-14 sm:h-16 sm:text-4xl'}
        `}
      >
        <div className="absolute w-full h-[1px] bg-black/40 top-1/2 z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div key={value} className="relative z-0 animate-flip-in">
          {formattedValue}
        </div>
      </div>
      {label && (
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {label}
        </span>
      )}
    </div>
  );
};

const Separator: React.FC = () => (
  <div className="flex flex-col space-y-1 sm:space-y-2 justify-center items-center h-10 sm:h-16 mx-0.5">
    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
  </div>
);

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const dateString = time.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col items-center justify-center pt-0 pb-4">
      <div className="mb-2 flex items-center space-x-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
        <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
          {dateString}
        </span>
      </div>
      <div className="flex items-end">
        <FlipCard value={hours} label="Hrs" />
        <Separator />
        <FlipCard value={minutes} label="Min" />
        <Separator />
        <FlipCard value={seconds} label="Sec" size="small" />
      </div>
      <style>{`
        @keyframes flipIn {
          0% { transform: rotateX(-90deg) scale(0.9); opacity: 0; }
          100% { transform: rotateX(0deg) scale(1); opacity: 1; }
        }
        .animate-flip-in {
          animation: flipIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
          transform-origin: center;
        }
        .animate-fade-in {
            animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// --- Main Component ---

interface WeeklyViewProps {
  habits: Habit[];
  completions: CompletionData;
  sleepData: SleepData;
  onUpdateSleep: (dateStr: string, minutes: number) => void;
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  habits,
  completions,
  sleepData,
  onUpdateSleep,
  currentDate,
  onToggle,
  onPrevWeek,
  onNextWeek
}) => {
  const weekDays = getWeekDays(currentDate);
  const [dailyTip, setDailyTip] = useState<string>('');
  
  // Normalize today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch AI tip
  useEffect(() => {
    let mounted = true;
    const fetchTip = async () => {
       if (habits.length > 0) {
           const tip = await generateDailyTip(habits, completions);
           if (mounted) setDailyTip(tip);
       }
    };
    fetchTip();
    return () => { mounted = false; };
  }, [habits.length]);

  const quote = useMemo(() => {
    const hour = new Date().getHours();
    return QUOTES[hour % QUOTES.length];
  }, []);

  // Prepare Sleep Data for Graph
  let totalHours = 0;
  const sleepChartData = weekDays.map(day => {
      const dateStr = formatDate(day);
      const mins = sleepData[dateStr] !== undefined ? sleepData[dateStr] : 360; // Default 360 mins (6h)
      totalHours += mins / 60;
      return {
          name: day.toLocaleDateString(undefined, { weekday: 'short' }),
          hours: Number((mins / 60).toFixed(1)),
          fullDate: dateStr
      };
  });
  const avgSleep = (totalHours / 7).toFixed(1);

  const handleSleepInput = (dateStr: string, type: 'h' | 'm', value: string) => {
      const currentMins = sleepData[dateStr] !== undefined ? sleepData[dateStr] : 360;
      const currentH = Math.floor(currentMins / 60);
      const currentM = currentMins % 60;
      
      let newMins = currentMins;
      let val = parseInt(value);
      if (isNaN(val)) val = 0;

      if (type === 'h') {
          // Clamp hours 0-23
          val = Math.min(Math.max(val, 0), 23);
          newMins = (val * 60) + currentM;
      } else {
          // Clamp minutes 0-59
          val = Math.min(Math.max(val, 0), 59);
          newMins = (currentH * 60) + val;
      }
      onUpdateSleep(dateStr, newMins);
  };
  
  // Ticks for Y Axis (0 to 14 hours)
  const yTicks = Array.from({length: 15}, (_, i) => i);

  return (
    <div className="space-y-6">
       
       {/* AI Daily Tip */}
       {dailyTip && (
         <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">AI Coach says:</h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium leading-relaxed">"{dailyTip}"</p>
            </div>
         </div>
       )}

       {/* Quote */}
       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
            <Quote size={120} fill="currentColor" />
         </div>
         <div className="relative z-10 text-center flex flex-col items-center">
            <h3 className="text-lg sm:text-2xl font-serif font-medium italic leading-relaxed max-w-2xl">"{quote}"</h3>
            <p className="mt-2 text-indigo-200 text-xs sm:text-sm font-medium tracking-wider uppercase opacity-80">Daily Inspiration</p>
         </div>
      </div>

      <ClockWidget />

      {/* Weekly Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 gap-3 sm:gap-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Weekly Matrix</h2>
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 sm:bg-transparent px-3 py-1 rounded-full shadow-sm sm:shadow-none border sm:border-none border-slate-200 dark:border-slate-600">
              <button onClick={onPrevWeek} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[120px] text-center">
                  {weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <button onClick={onNextWeek} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[600px] sm:min-w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left p-3 sm:p-4 w-1/4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Habit</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="p-2 sm:p-4 text-center w-[10%]">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                      <span className={`text-xs sm:text-sm font-bold mt-0.5 ${formatDate(day) === formatDate(new Date()) ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {habits.length === 0 ? (
                  <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">No habits added yet. Start by adding one above!</td>
                  </tr>
              ) : (
                  habits.map((habit) => (
                  <tr key={habit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="p-3 sm:p-4 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <div className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{habit.name}</div>
                          <div className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">{habit.category}</div>
                      </td>
                      {weekDays.map((day) => {
                      const dateStr = formatDate(day);
                      const isCompleted = completions[habit.id]?.[dateStr] || false;
                      const dayDate = new Date(day);
                      dayDate.setHours(0,0,0,0);
                      const isPast = dayDate.getTime() < today.getTime();
                      
                      return (
                          <td key={`${habit.id}-${dateStr}`} className="p-1 sm:p-2 text-center">
                          <div className="flex justify-center">
                              <button
                                  onClick={() => !isPast && onToggle(habit.id, dateStr)}
                                  disabled={isPast}
                                  className={`
                                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90
                                      ${isPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                      ${isCompleted 
                                          ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/50 transform scale-100' 
                                          : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                                      }
                                      ${isPast && !isCompleted ? 'bg-slate-50 dark:bg-slate-800' : ''}
                                  `}
                              >
                                  {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : isPast ? <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5 opacity-50" />}
                              </button>
                          </div>
                          </td>
                      );
                      })}
                  </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sleep Tracker Card (Innovative Redesign) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300">
         {/* Subtle Background Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 z-0"></div>
         
         <div className="relative z-10 p-5 sm:p-8">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                 <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                         <CloudMoon className="w-7 h-7" />
                     </div>
                     <div>
                         <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Sleep Hygiene</h2>
                         <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Weekly Restoration Analysis</p>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800/80 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-300 font-medium">Avg Sleep:</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{avgSleep}h</span>
                 </div>
             </div>
             
             {/* Graph Area - Responsive Height (300px mobile, 400px desktop) */}
             <div className="h-[300px] sm:h-[400px] w-full mb-8">
                 <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={sleepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                             <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                         <XAxis 
                             dataKey="name" 
                             tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                             axisLine={false} 
                             tickLine={false} 
                             dy={10}
                         />
                         <YAxis 
                             domain={[0, 14]}
                             ticks={yTicks}
                             interval={0}
                             tick={{fontSize: 11, fill: '#64748b'}} 
                             axisLine={false} 
                             tickLine={false} 
                         />
                         <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', padding: '10px 14px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                            formatter={(val: number) => [`${val} hrs`, 'Sleep Time']}
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                         />
                         <Area 
                             type="monotone" 
                             dataKey="hours" 
                             stroke="#6366f1" 
                             strokeWidth={3} 
                             fillOpacity={1} 
                             fill="url(#sleepGradient)" 
                             activeDot={{r: 6, strokeWidth: 0, fill: '#818cf8'}}
                         />
                     </AreaChart>
                 </ResponsiveContainer>
             </div>

             {/* Innovative Inputs - Flex container for mobile scrolling */}
             <div className="flex sm:grid sm:grid-cols-7 overflow-x-auto gap-3 pb-4 sm:pb-0 snap-x scrollbar-hide">
                 {weekDays.map(day => {
                     const dateStr = formatDate(day);
                     const mins = sleepData[dateStr] !== undefined ? sleepData[dateStr] : 360;
                     const h = Math.floor(mins / 60);
                     const m = mins % 60;
                     const isToday = formatDate(day) === formatDate(new Date());
                     
                     return (
                         <div key={dateStr} className="flex flex-col items-center gap-3 group min-w-[70px] w-full snap-center">
                             <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isToday ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                 {day.toLocaleDateString(undefined, {weekday:'short'})}
                             </span>
                             
                             <div className={`
                                flex flex-col w-full bg-white dark:bg-slate-800 rounded-xl border p-1 transition-all duration-300
                                ${isToday 
                                    ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'}
                             `}>
                                 <div className="relative border-b border-slate-100 dark:border-slate-700">
                                     <input 
                                         type="text" 
                                         inputMode="numeric"
                                         value={h}
                                         onChange={(e) => handleSleepInput(dateStr, 'h', e.target.value)}
                                         className="w-full bg-transparent text-center text-sm font-bold text-slate-700 dark:text-slate-200 outline-none p-1.5 focus:text-indigo-500"
                                     />
                                     <span className="absolute top-1 right-1 text-[8px] text-slate-400 font-medium">H</span>
                                 </div>
                                 <div className="relative">
                                     <input 
                                         type="text" 
                                         inputMode="numeric"
                                         value={m.toString().padStart(2, '0')}
                                         onChange={(e) => handleSleepInput(dateStr, 'm', e.target.value)}
                                         className="w-full bg-transparent text-center text-sm font-bold text-slate-500 dark:text-slate-400 outline-none p-1.5 focus:text-indigo-500"
                                     />
                                     <span className="absolute top-1 right-1 text-[8px] text-slate-400 font-medium">M</span>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         </div>
      </div>
    </div>
  );
};

export default WeeklyView;