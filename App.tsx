import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, Calendar, LayoutDashboard, Zap, UserCircle, Sparkles } from 'lucide-react';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import StatsView from './components/StatsView';
import DashboardView from './components/DashboardView';
import AboutView from './components/AboutView';
import InsightsView from './components/InsightsView';
import { Habit, CompletionData, ViewMode, UserProfile, SleepData } from './types';
import { getMonday, addDays } from './utils';

// Initial dummy data
const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Morning Run (5k)', category: 'Health', created: new Date().toISOString() },
  { id: '2', name: 'Read 30 mins', category: 'Learning', created: new Date().toISOString() },
  { id: '3', name: 'Drink 2L Water', category: 'Health', created: new Date().toISOString() },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Guest User',
  tagline: 'Building habits, one day at a time.',
  avatarUrl: '' // Empty string implies default icon
};

function App() {
  // --- State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [completions, setCompletions] = useState<CompletionData>(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : {};
  });

  const [sleepData, setSleepData] = useState<SleepData>(() => {
    const saved = localStorage.getItem('sleepData');
    return saved ? JSON.parse(saved) : {};
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  // Changed default to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const [currentDate, setCurrentDate] = useState(new Date()); // Controls the view date
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('General');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem('sleepData', JSON.stringify(sleepData));
  }, [sleepData]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // --- Handlers ---
  const toggleHabit = (habitId: string, dateStr: string) => {
    setCompletions(prev => {
      const habitData = prev[habitId] || {};
      return {
        ...prev,
        [habitId]: {
          ...habitData,
          [dateStr]: !habitData[dateStr]
        }
      };
    });
  };

  const updateSleep = (dateStr: string, minutes: number) => {
      setSleepData(prev => ({
          ...prev,
          [dateStr]: minutes
      }));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName,
      category: newHabitCategory,
      created: new Date().toISOString()
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitCategory('General');
    setIsAddModalOpen(false);
  };

  const deleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
        setHabits(habits.filter(h => h.id !== id));
    }
  };

  // --- Date Navigation ---
  // Weekly nav
  const prevWeek = () => setCurrentDate(d => addDays(d, -7));
  const nextWeek = () => setCurrentDate(d => addDays(d, 7));
  
  // Monthly nav
  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Determine current viewing anchor based on mode
  const currentWeekStart = getMonday(currentDate);

  // Reusable footer component
  const FooterContent = () => (
      <div className={`text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>Made with</span>
          <span className="mx-1.5 relative inline-flex items-center justify-center">
              <span className="absolute animate-ping inline-flex h-3 w-3 rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex text-pink-500">♡</span>
          </span>
          <span>by</span>
          <span className="ml-1.5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 font-extrabold font-mono hover:scale-105 transition-transform cursor-default shadow-sm">
            Dhakad Labs
          </span>
      </div>
  );

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 shadow-sm sm:shadow-none transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setViewMode('weekly')}>
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              HabitFlow
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
             {/* Profile Display in Header */}
             <div 
               className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
               onClick={() => setViewMode('dashboard')}
             >
                <span className={`block text-sm font-medium mr-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600'}`}>
                  {userProfile.name}
                </span>
                <div className={`p-1 rounded-full border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'} ${viewMode === 'dashboard' ? 'ring-2 ring-indigo-500' : ''}`}>
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Profile" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover" />
                  ) : (
                    <UserCircle className={`w-6 h-6 sm:w-7 sm:h-7 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  )}
                </div>
             </div>

             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center shadow-lg shadow-indigo-500/30 active:scale-95 ml-2"
            >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">New Habit</span><span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full">
        
        {/* Navigation Tabs (Floating Dock on Mobile) */}
        {viewMode !== 'about' && (
          <div className={`
            fixed bottom-4 left-4 right-4 z-50 rounded-2xl p-2 flex items-center justify-around shadow-2xl backdrop-blur-md border border-white/10
            sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:shadow-sm sm:border sm:bg-transparent sm:p-0 sm:space-x-2 sm:justify-start
            ${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'}
            sm:${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          `}>
            <button 
                onClick={() => setViewMode('weekly')}
                className={`
                  flex flex-col sm:flex-row items-center justify-center p-2 sm:px-4 sm:py-2 rounded-xl transition-all
                  ${viewMode === 'weekly' 
                    ? (theme === 'dark' ? 'text-indigo-400 bg-slate-700' : 'text-indigo-600 bg-indigo-50 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}
                `}
              >
                <LayoutGrid className={`w-6 h-6 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2 ${viewMode === 'weekly' ? 'fill-current opacity-20' : ''}`} strokeWidth={viewMode === 'weekly' ? 2.5 : 2} /> 
                <span className="text-[10px] sm:text-sm font-medium">Weekly</span>
            </button>
            
            <button 
                onClick={() => setViewMode('monthly')}
                className={`
                  flex flex-col sm:flex-row items-center justify-center p-2 sm:px-4 sm:py-2 rounded-xl transition-all
                  ${viewMode === 'monthly' 
                    ? (theme === 'dark' ? 'text-indigo-400 bg-slate-700' : 'text-indigo-600 bg-indigo-50 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}
                `}
              >
                <Calendar className={`w-6 h-6 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2 ${viewMode === 'monthly' ? 'fill-current opacity-20' : ''}`} strokeWidth={viewMode === 'monthly' ? 2.5 : 2} /> 
                <span className="text-[10px] sm:text-sm font-medium">Monthly</span>
            </button>

            <button 
                onClick={() => setViewMode('insights')}
                className={`
                  flex flex-col sm:flex-row items-center justify-center p-2 sm:px-4 sm:py-2 rounded-xl transition-all
                  ${viewMode === 'insights' 
                    ? (theme === 'dark' ? 'text-indigo-400 bg-slate-700' : 'text-indigo-600 bg-indigo-50 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}
                `}
              >
                <Sparkles className={`w-6 h-6 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2 ${viewMode === 'insights' ? 'fill-current opacity-20' : ''}`} strokeWidth={viewMode === 'insights' ? 2.5 : 2} /> 
                <span className="text-[10px] sm:text-sm font-medium">Insights</span>
            </button>
            
            <button 
                onClick={() => setViewMode('dashboard')}
                className={`
                  flex flex-col sm:flex-row items-center justify-center p-2 sm:px-4 sm:py-2 rounded-xl transition-all
                  ${viewMode === 'dashboard' 
                    ? (theme === 'dark' ? 'text-indigo-400 bg-slate-700' : 'text-indigo-600 bg-indigo-50 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}
                `}
              >
                <LayoutDashboard className={`w-6 h-6 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2 ${viewMode === 'dashboard' ? 'fill-current opacity-20' : ''}`} strokeWidth={viewMode === 'dashboard' ? 2.5 : 2} /> 
                <span className="text-[10px] sm:text-sm font-medium">Dashboard</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20 sm:pb-0">
          
          {/* View: Weekly */}
          {viewMode === 'weekly' && (
            <>
                <WeeklyView 
                    habits={habits}
                    completions={completions}
                    sleepData={sleepData}
                    onUpdateSleep={updateSleep}
                    currentDate={currentWeekStart}
                    onToggle={toggleHabit}
                    onPrevWeek={prevWeek}
                    onNextWeek={nextWeek}
                />
                <StatsView 
                    habits={habits} 
                    completions={completions} 
                    theme={theme} 
                    currentDate={currentWeekStart}
                />
            </>
          )}

          {/* View: Monthly */}
          {viewMode === 'monthly' && (
            <MonthlyView 
              habits={habits}
              completions={completions}
              sleepData={sleepData}
              currentDate={currentDate}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              theme={theme}
            />
          )}

          {/* View: Insights */}
          {viewMode === 'insights' && (
            <InsightsView 
                habits={habits}
                completions={completions}
                sleepData={sleepData}
            />
          )}

          {/* View: Dashboard */}
          {viewMode === 'dashboard' && (
            <DashboardView 
                habits={habits} 
                completions={completions}
                sleepData={sleepData}
                userProfile={userProfile}
                onUpdateProfile={setUserProfile}
                theme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                onDeleteHabit={deleteHabit}
                onAddHabit={() => setIsAddModalOpen(true)} 
                onGoToAbout={() => setViewMode('about')}
            />
          )}

          {/* View: About */}
          {viewMode === 'about' && (
             <AboutView onBack={() => setViewMode('dashboard')} />
          )}

        </div>
      </main>

      {/* Desktop Footer (Hidden on Mobile as we have no space there) */}
      <footer className={`hidden sm:block w-full py-8 text-center mt-auto border-t transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
         <FooterContent />
      </footer>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-5 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                <div>
                  <h3 className="text-lg font-bold">Create New Habit</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Commit to something new today.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className={`text-2xl ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                  &times;
                </button>
            </div>
            <form onSubmit={addHabit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Habit Name</label>
                <input 
                  type="text"
                  required
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="e.g., Read 10 pages"
                  className={`w-full px-4 py-3 sm:py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                <div className="relative">
                  <select 
                    value={newHabitCategory}
                    onChange={e => setNewHabitCategory(e.target.value)}
                    className={`w-full px-4 py-3 sm:py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-base ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option>Health</option>
                    <option>Productivity</option>
                    <option>Learning</option>
                    <option>Mindfulness</option>
                    <option>General</option>
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`hidden sm:block px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;