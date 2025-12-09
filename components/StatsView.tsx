import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import { Habit, CompletionData } from '../types';
import { formatDate, getWeekDays, addDays, getMonday, HABIT_COLORS } from '../utils';

interface StatsViewProps {
  habits: Habit[];
  completions: CompletionData;
  theme: 'light' | 'dark';
  currentDate: Date; // The start of the currently viewed week
}

const StatsView: React.FC<StatsViewProps> = ({ habits, completions, theme, currentDate }) => {
  // --- Data Generation Helper ---
  const generateWeekData = (startDate: Date) => {
      const days = getWeekDays(startDate);
      return days.map(d => {
        const dateStr = formatDate(d);
        let completedCount = 0;
        habits.forEach(h => {
          if (completions[h.id]?.[dateStr]) completedCount++;
        });
        return {
          date: d.toLocaleDateString(undefined, { weekday: 'short' }),
          completed: completedCount,
          total: habits.length,
          fullDate: d
        };
      });
  };

  // Current Week Data (based on the view matrix)
  const currentWeekData = generateWeekData(currentDate);

  // Last Week Data (Static: Always the most recent fully completed week, i.e., last week relative to Today)
  const today = new Date();
  const thisWeekMonday = getMonday(today);
  const lastWeekStaticDate = addDays(thisWeekMonday, -7);
  const lastWeekData = generateWeekData(lastWeekStaticDate);

  // Individual Habit Data Generation (based on the view matrix)
  const individualHabitData = habits.map((habit, index) => {
      const weekDays = getWeekDays(currentDate);
      const data = weekDays.map(d => ({
          name: d.toLocaleDateString(undefined, { weekday: 'short' }),
          value: completions[habit.id]?.[formatDate(d)] ? 1 : 0
      }));
      return {
          ...habit,
          data,
          color: HABIT_COLORS[index % HABIT_COLORS.length]
      };
  });

  // --- Theme Colors ---
  const axisColor = theme === 'dark' ? '#94a3b8' : '#94a3b8'; // Slate 400
  const gridColor = theme === 'dark' ? '#334155' : '#f1f5f9'; // Slate 700 vs Slate 100
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff'; // Slate 800 vs White
  const tooltipText = theme === 'dark' ? '#f1f5f9' : '#1e293b';

  if (habits.length === 0) {
      return (
          <div className={`p-8 text-center rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <p>Add habits to see statistics.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Daily Completion (Current Viewed Week) */}
      <div className={`p-4 sm:p-6 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Daily Completion (This Week)</h3>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentWeekData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" tick={{fontSize: 10, fill: axisColor}} interval={0} stroke={axisColor} />
              <YAxis 
                allowDecimals={false} 
                tick={{fontSize: 10, fill: axisColor}} 
                domain={[0, habits.length]} 
                stroke={axisColor} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                itemStyle={{ color: tooltipText }}
                formatter={(value: number, name: string, props: any) => [`${value}/${props.payload.total}`, 'Habits Completed']}
                cursor={{ stroke: axisColor, strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: theme === 'dark' ? '#1e293b' : '#fff' }}
                activeDot={{ r: 6, fill: '#4f46e5' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Daily Completion (Last Ended Week) */}
      <div className={`p-4 sm:p-6 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Performance (Last Full Week)</h3>
            <span className={`text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {lastWeekStaticDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {addDays(lastWeekStaticDate, 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
        </div>
        <div className="h-40 sm:h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lastWeekData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" tick={{fontSize: 10, fill: axisColor}} interval={0} stroke={axisColor} />
              <YAxis 
                allowDecimals={false} 
                tick={{fontSize: 10, fill: axisColor}} 
                domain={[0, habits.length]} 
                stroke={axisColor} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                itemStyle={{ color: tooltipText }}
                formatter={(value: number, name: string, props: any) => [`${value}/${props.payload.total}`, 'Habits Completed']}
                cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.5 }}
              />
              <Bar 
                dataKey="completed" 
                fill="#64748b" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3. Individual Habit Graphs */}
      <div className={`p-4 sm:p-6 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
         <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Individual Progress (This Week)</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {individualHabitData.map((habit) => (
                <div key={habit.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{habit.name}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></div>
                    </div>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={habit.data} margin={{ top: 5, right: 0, bottom: 0, left: -25 }}>
                                <XAxis 
                                  dataKey="name" 
                                  tick={{fontSize: 8, fill: axisColor}} 
                                  axisLine={false} 
                                  tickLine={false} 
                                  interval={0} 
                                />
                                <YAxis hide domain={[0, 1]} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
                                    {habit.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value ? habit.color : (theme === 'dark' ? '#334155' : '#e2e8f0')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default StatsView;