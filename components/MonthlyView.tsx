import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Target, Calendar as CalendarIcon, BarChart2, Moon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, YAxis, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { Habit, CompletionData, SleepData } from '../types';
import { formatDate, getMonthDays, HABIT_COLORS } from '../utils';

interface MonthlyViewProps {
  habits: Habit[];
  completions: CompletionData;
  sleepData: SleepData;
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  theme: 'light' | 'dark';
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  habits,
  completions,
  sleepData,
  currentDate,
  onPrevMonth,
  onNextMonth,
  theme
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
        setSelectedHabitId(habits[0].id);
    } else if (habits.length > 0 && !habits.find(h => h.id === selectedHabitId)) {
        setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  // --- Monthly Report Stats & Graph Data ---
  const getMonthlyStats = () => {
    let totalCompletions = 0;
    let perfectDays = 0;
    const daysInMonth = days.filter(d => d !== null) as Date[];
    const graphData: { name: string; value: number; total: number; sleepHours: number }[] = [];

    daysInMonth.forEach(day => {
        const dateStr = formatDate(day);
        let dayCompletions = 0;
        habits.forEach(h => {
            if (completions[h.id]?.[dateStr]) {
                dayCompletions++;
                totalCompletions++;
            }
        });
        if (habits.length > 0 && dayCompletions === habits.length) {
            perfectDays++;
        }
        
        const sleepMins = sleepData[dateStr] !== undefined ? sleepData[dateStr] : 360;
        
        graphData.push({ 
            name: String(day.getDate()), 
            value: dayCompletions, 
            total: habits.length,
            sleepHours: Number((sleepMins/60).toFixed(1))
        });
    });

    return { totalCompletions, perfectDays, graphData };
  };

  const stats = getMonthlyStats();

  const getWeeklyStats = () => {
      const weeks = [
          { label: 'Week 1', start: 1, end: 7 },
          { label: 'Week 2', start: 8, end: 14 },
          { label: 'Week 3', start: 15, end: 21 },
          { label: 'Week 4', start: 22, end: 31 }
      ];
      
      return weeks.map(w => {
          let possible = 0;
          let actual = 0;
          for(let d=w.start; d<=w.end; d++) {
             const date = new Date(year, month, d);
             if (date.getMonth() !== month) break;
             possible += habits.length;
             const dateStr = formatDate(date);
             habits.forEach(h => {
                 if (completions[h.id]?.[dateStr]) actual++;
             });
          }
          return {
              name: w.label,
              percentage: possible === 0 ? 0 : Math.round((actual / possible) * 100)
          };
      });
  };
  
  const weeklyStats = getWeeklyStats();

  const getIndividualHabitStats = () => {
    if (!selectedHabitId) return { data: [], color: '#ccc' };

    const selectedHabitIndex = habits.findIndex(h => h.id === selectedHabitId);
    const color = HABIT_COLORS[selectedHabitIndex % HABIT_COLORS.length];

    const weeks = [
        { label: 'W1', start: 1, end: 7 },
        { label: 'W2', start: 8, end: 14 },
        { label: 'W3', start: 15, end: 21 },
        { label: 'W4', start: 22, end: 31 }
    ];

    const data = weeks.map(w => {
        let count = 0;
        let daysCount = 0;
        for(let d=w.start; d<=w.end; d++) {
           const date = new Date(year, month, d);
           if (date.getMonth() !== month) break;
           daysCount++;
           const dateStr = formatDate(date);
           if (completions[selectedHabitId]?.[dateStr]) count++;
        }
        return { name: w.label, count: count, total: daysCount };
    });
    return { data, color };
  };

  const { data: individualStats, color: habitColor } = getIndividualHabitStats();

  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#f1f5f9' : '#1e293b';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  // Ticks for Y Axis (0 to 14 hours)
  const yTicks = Array.from({length: 15}, (_, i) => i);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className={`p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Target className="w-5 h-5 text-indigo-500 mb-1" />
                <span className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{stats.totalCompletions}</span>
                <span className={`text-[10px] sm:text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Check-ins</span>
            </div>
            <div className={`p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                <span className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{stats.perfectDays}</span>
                <span className={`text-[10px] sm:text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Perfect Days</span>
            </div>
            <div className={`p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <CalendarIcon className="w-5 h-5 text-blue-500 mb-1" />
                <span className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{currentDate.toLocaleDateString(undefined, {month:'short'})}</span>
                <span className={`text-[10px] sm:text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Active Month</span>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className={`rounded-xl shadow-sm border p-3 sm:p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h2 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Monthly Tracker</h2>
                <div className={`flex items-center space-x-2 sm:space-x-4 p-1 rounded-lg ${theme === 'dark' ? 'bg-slate-700 sm:bg-transparent' : 'bg-slate-50 sm:bg-transparent'}`}>
                <button onClick={onPrevMonth} className={`p-2 rounded-full transition-colors shadow-sm sm:shadow-none ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-600 sm:bg-transparent' : 'bg-white hover:bg-slate-200 sm:bg-transparent'}`}>
                    <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                </button>
                <span className={`text-base sm:text-lg font-medium min-w-[120px] sm:min-w-[140px] text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={onNextMonth} className={`p-2 rounded-full transition-colors shadow-sm sm:shadow-none ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-600 sm:bg-transparent' : 'bg-white hover:bg-slate-200 sm:bg-transparent'}`}>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {weekDays.map(d => (
                <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase py-1 sm:py-2">
                    {d.charAt(0)}<span className="hidden sm:inline">{d.slice(1)}</span>
                </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
                {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className={`min-h-[3rem] sm:min-h-[6rem] rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50/50'}`}></div>;
                
                const dateStr = formatDate(day);
                const bgColor = theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50';
                const borderColor = theme === 'dark' ? 'border-slate-600' : 'border-slate-100';
                const completedCount = habits.filter(h => completions[h.id]?.[dateStr]).length;

                return (
                    <div key={dateStr} className={`min-h-[3.5rem] sm:h-24 p-1 sm:p-2 rounded-md sm:rounded-lg border ${bgColor} ${borderColor} flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden`}>
                        <span className={`text-xs sm:text-sm font-bold ${formatDate(day) === formatDate(new Date()) ? 'text-blue-500' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                            {day.getDate()}
                        </span>
                        <div className="flex flex-col gap-0.5 sm:gap-0.5 mt-1 sm:mt-0 flex-grow justify-center">
                            <div className="flex flex-wrap gap-1 content-center">
                                {habits.map((h, i) => (
                                    <div 
                                        key={h.id} 
                                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${completions[h.id]?.[dateStr] ? `shadow-[0_0_3px_rgba(255,255,255,0.4)]` : (theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300')}`}
                                        style={{ backgroundColor: completions[h.id]?.[dateStr] ? HABIT_COLORS[i % HABIT_COLORS.length] : undefined }}
                                        title={h.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:block text-[10px] text-slate-400 self-end font-medium">
                            {completedCount}/{habits.length}
                        </div>
                    </div>
                );
                })}
            </div>
        </div>

        {/* Completion Trend Graph */}
        <div className={`p-4 sm:p-6 rounded-xl border shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Completion Trend (Habits per Day)</h3>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.graphData}>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', backgroundColor: tooltipBg, color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                            formatter={(value: number, name: string, props: any) => [`${value}/${props.payload.total}`, 'Completed']}
                        />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: axisColor}} interval={3} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{fontSize: 10, fill: axisColor}} domain={[0, habits.length]} />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Sleep Tracker Graph - Responsive Height */}
        <div className={`p-4 sm:p-6 rounded-xl border shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center space-x-2 mb-4">
                <Moon className="w-4 h-4 text-cyan-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Sleep Trend (Hours)</h3>
            </div>
            <div className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.graphData}>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', backgroundColor: tooltipBg, color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                            formatter={(value: number) => [`${value} hrs`, 'Sleep']}
                        />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: axisColor}} interval={3} axisLine={false} tickLine={false} />
                        <YAxis 
                             tick={{fontSize: 10, fill: axisColor}} 
                             domain={[0, 14]} 
                             ticks={yTicks}
                             interval={0}
                             allowDecimals={true} 
                        />
                        <Line type="monotone" dataKey="sleepHours" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Weekly Improvement & Individual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 sm:p-6 rounded-xl border shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Weekly Improvement</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyStats} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                            <XAxis dataKey="name" tick={{fontSize: 10, fill: axisColor}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 10, fill: axisColor}} domain={[0, 100]} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', backgroundColor: tooltipBg, color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                                cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4}}
                            />
                            <Bar dataKey="percentage" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-xl border shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <div className="flex items-center space-x-2">
                        <BarChart2 className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Individual Habit Trends</h3>
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                        <select 
                            value={selectedHabitId}
                            onChange={(e) => setSelectedHabitId(e.target.value)}
                            className={`w-full sm:w-48 appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-medium outline-none border focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        >
                            {habits.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="h-48 w-full">
                    {habits.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={individualStats} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: axisColor}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: axisColor}} allowDecimals={false} domain={[0, 7]} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', backgroundColor: tooltipBg, color: tooltipText }}
                                    itemStyle={{ color: tooltipText }}
                                    formatter={(value: number, name: string, props: any) => [`${value}/${props.payload.total}`, 'Days Completed']}
                                    cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4}}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                                    {individualStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={habitColor} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                            No habits to display.
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default MonthlyView;