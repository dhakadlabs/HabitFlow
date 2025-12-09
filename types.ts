export interface Habit {
  id: string;
  name: string;
  category: string;
  created: string; // ISO Date string
}

export interface CompletionData {
  [habitId: string]: {
    [dateString: string]: boolean; // dateString in YYYY-MM-DD
  };
}

export interface SleepData {
  [dateString: string]: number; // Total minutes
}

export interface UserProfile {
  name: string;
  tagline: string;
  avatarUrl: string; // Base64 or URL
}

export type ViewMode = 'weekly' | 'monthly' | 'dashboard' | 'insights' | 'about';

export interface DayStats {
  date: string;
  completed: number;
  total: number;
}

export interface Badge {
  name: string;
  emoji: string;
  description: string;
  color: string; // simple color name like 'indigo', 'purple', 'emerald'
}

export interface InsightData {
  weeklyVibe: string;
  winningStreak: string;
  roomForGrowth: string;
  smartTip: string;
  badges: Badge[];
}