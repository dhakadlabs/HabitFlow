import React, { useState } from 'react';
import { Download, User, Trash2, PlusCircle, Activity, Settings, Moon, Sun, UserCircle, Edit3, X, Info, UploadCloud, FileText } from 'lucide-react';
import { Habit, CompletionData, UserProfile, SleepData } from '../types';
import { exportToPDF, formatDate } from '../utils';

interface DashboardViewProps {
  habits: Habit[];
  completions: CompletionData;
  sleepData: SleepData;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onDeleteHabit: (id: string) => void;
  onAddHabit: () => void;
  onGoToAbout: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  habits, 
  completions,
  sleepData,
  userProfile,
  onUpdateProfile,
  theme,
  onToggleTheme,
  onDeleteHabit,
  onAddHabit,
  onGoToAbout
}) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(formatDate(firstDay));
  const [endDate, setEndDate] = useState(formatDate(today));
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);

  const handleExport = () => {
    exportToPDF(habits, completions, sleepData, new Date(startDate), new Date(endDate));
    setIsExportModalOpen(false);
  };

  const setRange = (months: number) => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - months);
      start.setDate(1);
      
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditingProfile(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-6 md:col-span-1">
        <div className={`relative rounded-xl p-6 shadow-sm border flex flex-col items-center text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
             <button 
               onClick={() => {
                   setEditForm(userProfile);
                   setIsEditingProfile(true);
               }}
               className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
               title="Edit Profile"
             >
                <Settings className="w-5 h-5" />
             </button>

             <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1 shadow-lg mb-4 relative group">
                <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                    {userProfile.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-12 h-12 text-slate-400" />
                    )}
                </div>
            </div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{userProfile.name}</h2>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{userProfile.tagline}</p>
            
            <div className={`w-full border-t pt-6 space-y-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                 <div className="flex justify-between items-center text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Total Habits</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habits.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Theme</span>
                    <button 
                        onClick={onToggleTheme}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                        <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                 </div>
            </div>
        </div>

        <div 
            onClick={() => setIsExportModalOpen(true)}
            className={`cursor-pointer rounded-xl p-4 border flex items-center justify-between transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:shadow-md'}`}
        >
             <div className="flex items-center space-x-4">
                 <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                     <FileText className="w-5 h-5" />
                 </div>
                 <div>
                     <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Export Data</h3>
                     <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Download PDF reports</p>
                 </div>
             </div>
             <Download className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>

        <div 
            onClick={onGoToAbout}
            className={`cursor-pointer rounded-xl p-4 border flex items-center justify-between transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:shadow-md'}`}
        >
             <div className="flex items-center space-x-4">
                 <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-lg text-white shadow-lg shadow-pink-500/30">
                     <Info className="w-5 h-5" />
                 </div>
                 <div>
                     <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>About Dhakad Labs</h3>
                     <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Meet the team</p>
                 </div>
             </div>
        </div>
      </div>

      <div className="md:col-span-2">
          <div className={`rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Manage Habits</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Add, remove, or update your tracking list.</p>
                  </div>
                  <button 
                    onClick={onAddHabit}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Habit</span>
                  </button>
              </div>
              <div className="p-2">
                  {habits.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic">No habits found. Create one to get started!</div>
                  ) : (
                      habits.map((habit) => (
                          <div key={habit.id} className={`group flex items-center justify-between p-4 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                              <div className="flex items-center space-x-4">
                                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                                      <Activity className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                  </div>
                                  <div>
                                      <h4 className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habit.name}</h4>
                                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                                          <span className={`px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>{habit.category}</span>
                                          <span>• Created {new Date(habit.created).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => onDeleteHabit(habit.id)}
                                className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                title="Delete Habit"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>

    {/* Edit Profile Modal */}
    {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Edit Profile</h3>
                    <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={saveProfile} className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700">
                                {editForm.avatarUrl ? (
                                    <img src={editForm.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <User className="w-10 h-10 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                <UploadCloud className="w-8 h-8 text-white" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Display Name</label>
                        <input 
                            type="text" 
                            required
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Tagline</label>
                        <input 
                            type="text" 
                            value={editForm.tagline}
                            onChange={e => setEditForm({...editForm, tagline: e.target.value})}
                            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                        />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {/* Export Modal */}
    {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Export Data</h3>
                    <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Select a date range for your PDF report.</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setRange(1)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                            Last Month
                        </button>
                        <button onClick={() => setRange(3)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                            Last 3 Months
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                            />
                        </div>
                    </div>

                    <button onClick={handleExport} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default DashboardView;