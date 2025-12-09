import { GoogleGenAI } from "@google/genai";
import { Habit, CompletionData, InsightData, SleepData } from '../types';
import { formatDate } from '../utils';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyTip = async (
  habits: Habit[],
  completions: CompletionData
): Promise<string> => {
  const ai = getGeminiClient();
  const today = formatDate(new Date());
  
  // Quick summary for context
  const completedToday = habits.filter(h => completions[h.id]?.[today]).length;
  const total = habits.length;

  const prompt = `
    You are a friendly habit coach.
    Context: User has completed ${completedToday} out of ${total} habits today.
    Habits: ${habits.map(h => h.name).join(', ')}.
    
    Task: Write a SINGLE, short, punchy, motivational sentence (max 20 words) to encourage them right now. 
    Use an emoji. Do not use "System Notice" or formal language. Be human and enthusiastic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Let's crush your goals today! 🚀";
  } catch (error) {
    console.error("Error generating tip:", error);
    return "Consistency is key! You got this. 🔥";
  }
};

export const generateHabitInsights = async (
  habits: Habit[],
  completions: CompletionData,
  sleepData: SleepData
): Promise<InsightData> => {
  const ai = getGeminiClient();
  
  // 1. Prepare Data Context
  const today = new Date();
  const recentDays: string[] = [];
  
  // Analyze last 14 days
  for (let i = 14; i >= 0; i--) { 
    const d = new Date();
    d.setDate(today.getDate() - i);
    recentDays.push(formatDate(d));
  }

  // Calculate generic stats
  let totalSleepMins = 0;
  let loggedSleepDays = 0;
  
  // Construct a detailed daily log for the AI
  const dailyLogs = recentDays.map(date => {
    // Sleep info
    const sleepMins = sleepData[date];
    let sleepStr = "Not tracked";
    if (sleepMins !== undefined) {
        totalSleepMins += sleepMins;
        loggedSleepDays++;
        const h = Math.floor(sleepMins / 60);
        const m = sleepMins % 60;
        sleepStr = `${h}h ${m}m`;
    }

    // Habit info
    const completed = habits.filter(h => completions[h.id]?.[date]).map(h => h.name);
    const missed = habits.filter(h => !completions[h.id]?.[date]).map(h => h.name);

    return `Date: ${date}
    - Sleep: ${sleepStr}
    - Habits Completed: ${completed.length > 0 ? completed.join(', ') : 'None'}
    - Habits Missed: ${missed.length > 0 ? missed.join(', ') : 'None'}`;
  }).join('\n\n');

  const avgSleep = loggedSleepDays > 0 ? (totalSleepMins / loggedSleepDays / 60).toFixed(1) : "N/A";

  // 2. Advanced Prompt Engineering
  const prompt = `
    You are the "Neural Core" of an advanced Habit & Biometric Tracker app. 
    Your role is to act as a high-performance behavioral analyst.

    --- USER DATA SNAPSHOT ---
    Average Sleep (Last 14 days): ${avgSleep} hours
    Total Active Habits: ${habits.length}
    Habit List: ${habits.map(h => `${h.name} (${h.category})`).join(', ')}

    --- DAILY PERFORMANCE LOG (Last 14 Days) ---
    ${dailyLogs}

    --- ANALYTICAL TASK ---
    1. **Correlate Sleep & Performance**: Analyze if low sleep causes specific habits to be missed. Does high sleep lead to perfect days?
    2. **Identify Micro-Trends**: Look for patterns like "Misses habits on weekends", "skips 'Read' when 'Run' is missed", etc.
    3. **Construct Feedback**: Give direct, constructive criticism or praise based on the data.

    --- REQUIRED JSON OUTPUT ---
    Return ONLY a valid JSON object matching this schema. Do not use Markdown blocks.

    {
      "weeklyVibe": "A cool, futuristic, personalized one-sentence summary of their performance vibe. Mention sleep if relevant.",
      "winningStreak": "Highlight their best performing habit or a positive sleep pattern.",
      "roomForGrowth": "Identify the habit with the most misses OR a sleep issue (e.g., 'Inconsistent sleep impacting Morning Run'). Be specific.",
      "smartTip": "A data-backed actionable tip. E.g., 'Try sleeping 7h+ to secure your Reading habit.'",
      "badges": [
        {
          "name": "Creative Badge Name",
          "emoji": "🏆",
          "description": "Specific reason they earned this based on data.",
          "color": "indigo" 
        }
      ]
    }
    
    *Badge Color Options*: indigo, emerald, amber, rose, cyan, purple.
    *Badge Criteria*: 
    - Consistent Sleep (>7h avg) -> "Restoration Master"
    - Perfect Streak -> "Unstoppable Force"
    - Weekend Warrior -> "Weekender"
    - Early Riser (deduced from context if possible, else generic consistency) -> "Early Bird"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as InsightData;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Fallback data
    return {
        weeklyVibe: "System initializing... gathering more data for analysis.",
        winningStreak: "Consistency Building",
        roomForGrowth: "Data Collection",
        smartTip: "Keep tracking your habits and sleep to unlock AI insights.",
        badges: [{ name: "Newcomer", emoji: "👋", description: "Welcome to HabitFlow", color: "cyan" }]
    };
  }
};