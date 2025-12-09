import { Habit, CompletionData, SleepData } from './types';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Predefined colors for individual habits
export const HABIT_COLORS = [
    '#4f46e5', // Indigo
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Red
    '#3b82f6', // Blue
];

export const QUOTES = [
  "Believe you can and you're halfway there.",
  "Your only limit is you.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "It always seems impossible until it is done.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "The secret of getting ahead is getting started.",
  "Dream big and dare to fail.",
  "Act as if what you do makes a difference. It does.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "You are what you repeatedly do. Excellence, then, is not an act, but a habit.",
  "Small daily improvements over time lead to stunning results.",
  "Don't wish it were easier. Wish you were better.",
  "The difference between who you are and who you want to be is what you do.",
  "Fall seven times, stand up eight.",
  "Your habits decide your future.",
  "Focus on the process, not the perfection.",
  "One day or day one. You decide.",
  "Consistency is the key to success."
];

export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

export const getMonthDays = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: (Date | null)[] = [];
  const startPadding = (firstDay.getDay() + 6) % 7; // 0 for Mon, 6 for Sun

  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

export const getCompletionStats = (
  habits: any[], 
  completions: any, 
  days: Date[]
) => {
  let completedCount = 0;
  let totalCount = habits.length * days.length;
  
  if (totalCount === 0) return 0;

  days.forEach(day => {
    const dateStr = formatDate(day);
    habits.forEach(habit => {
      if (completions[habit.id]?.[dateStr]) {
        completedCount++;
      }
    });
  });

  return Math.round((completedCount / totalCount) * 100);
};

export const exportToPDF = (habits: Habit[], completions: CompletionData, sleepData: SleepData, startDate: Date, endDate: Date) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- Helper: Header Banner ---
  const addHeader = (title: string) => {
     doc.setFillColor(67, 56, 202); // Indigo 700
     doc.rect(0, 0, pageWidth, 22, 'F');
     
     doc.setFont('helvetica', 'bold');
     doc.setFontSize(16);
     doc.setTextColor(255, 255, 255);
     doc.text(title, 14, 14);
     
     doc.setFont('helvetica', 'normal');
     doc.setFontSize(10);
     doc.setTextColor(224, 231, 255); // Indigo 100
     const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
     doc.text(`Period: ${dateRange}`, pageWidth - 14, 14, { align: 'right' });
  };

  let isFirstPage = true;

  // 1. Prepare Dates
  const dateArray: Date[] = [];
  let d = new Date(startDate);
  const safeEndDate = new Date(endDate);
  safeEndDate.setHours(23, 59, 59);

  while (d <= safeEndDate) {
      dateArray.push(new Date(d));
      d.setDate(d.getDate() + 1);
  }

  // 2. Group by Month for Pages
  const chunks: { monthLabel: string, dates: Date[] }[] = [];
  let currentKey = "";
  let currentChunk: Date[] = [];

  dateArray.forEach(date => {
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (key !== currentKey) {
          if (currentKey) chunks.push({ monthLabel: currentKey, dates: currentChunk });
          currentKey = key;
          currentChunk = [];
      }
      currentChunk.push(date);
  });
  if (currentChunk.length > 0) chunks.push({ monthLabel: currentKey, dates: currentChunk });

  // 3. Render Pages
  chunks.forEach((chunk) => {
      if (!isFirstPage) doc.addPage();
      addHeader(`Monthly Report: ${chunk.monthLabel}`);
      isFirstPage = false;
      
      const { dates } = chunk;

      // --- Matrix Table ---
      const head = [['Habit', ...dates.map(d => String(d.getDate()))]];
      const body = habits.map(habit => {
          const row = [habit.name];
          dates.forEach(date => {
              const dateStr = formatDate(date);
              const completed = completions[habit.id]?.[dateStr];
              // We use placeholders here; actual drawing happens in didDrawCell
              row.push(completed ? 'YES' : 'NO');
          });
          return row;
      });

      (autoTable as any)(doc, {
          startY: 32,
          head: head,
          body: body,
          styles: { 
              fontSize: 8, 
              cellPadding: 1.5, 
              halign: 'center', 
              valign: 'middle',
              lineColor: [226, 232, 240], // Slate 200
              lineWidth: 0.1
          },
          headStyles: { 
              fillColor: [67, 56, 202], // Indigo 700
              textColor: 255, 
              fontStyle: 'bold' 
          },
          columnStyles: { 
              0: { halign: 'left', fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] } // Slate 50
          },
          theme: 'striped',
          didParseCell: (data: any) => {
             // Clear text for data cells so we can draw symbols
             if (data.section === 'body' && data.column.index > 0) {
                 data.cell.text = []; 
             }
          },
          didDrawCell: (data: any) => {
              if (data.section === 'body' && data.column.index > 0) {
                  const raw = body[data.row.index][data.column.index];
                  const { x, y, width, height } = data.cell;
                  const cx = x + width / 2;
                  const cy = y + height / 2;
                  
                  if (raw === 'YES') {
                      // Draw Green Tick
                      doc.setDrawColor(22, 163, 74); // Green 600
                      doc.setLineWidth(0.6);
                      // Draw Checkmark path
                      doc.line(cx - 1.5, cy, cx - 0.5, cy + 1.5);
                      doc.line(cx - 0.5, cy + 1.5, cx + 2.5, cy - 2.5);
                  } else {
                      // Draw Red Cross
                      doc.setDrawColor(220, 38, 38); // Red 600
                      doc.setLineWidth(0.5);
                      const size = 1.2;
                      doc.line(cx - size, cy - size, cx + size, cy + size);
                      doc.line(cx + size, cy - size, cx - size, cy + size);
                  }
              }
          }
      });

      // --- Daily Trend Graph (Existing) ---
      const finalY = (doc as any).lastAutoTable.finalY || 30;
      let graphY = finalY + 15;
      const graphHeight = 40;
      
      // Title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text("Daily Completion Trend", 14, graphY - 4);

      // Graph Logic
      const graphData = dates.map(date => {
          const dateStr = formatDate(date);
          let count = 0;
          habits.forEach(h => {
              if (completions[h.id]?.[dateStr]) count++;
          });
          return { day: date.getDate(), count };
      });
      const maxHabits = Math.max(habits.length, 1);

      // Layout
      const marginX = 20; 
      const graphWidth = pageWidth - marginX - 14;
      
      // Axes
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.3);
      doc.line(marginX, graphY, marginX, graphY + graphHeight); // Y
      doc.line(marginX, graphY + graphHeight, marginX + graphWidth, graphY + graphHeight); // X

      // Plot Line & Labels
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.6);
      
      let prevX = -1;
      let prevY = -1;
      const xStep = graphWidth / (Math.max(dates.length - 1, 1));
      
      graphData.forEach((point, i) => {
          const x = marginX + (i * xStep);
          const y = graphY + graphHeight - ((point.count / maxHabits) * graphHeight);
          
          if (i > 0) doc.line(prevX, prevY, x, y);
          prevX = x;
          prevY = y;
          
          doc.setFillColor(79, 70, 229);
          doc.circle(x, y, 0.9, 'F');

          // Label the point
          if (point.count > 0) {
              doc.setFontSize(6);
              doc.setTextColor(79, 70, 229);
              doc.text(String(point.count), x, y - 2, { align: 'center' });
          }

          if (i % 2 === 0 || i === dates.length - 1) {
             doc.setFontSize(6);
             doc.setTextColor(100, 116, 139);
             doc.text(String(point.day), x, graphY + graphHeight + 4, { align: 'center' });
          }
      });

      // --- Sleep Tracker Graph (New) ---
      let sleepGraphY = graphY + graphHeight + 15;
      
      // Check for page overflow
      if (sleepGraphY + graphHeight > pageHeight - 10) {
          doc.addPage();
          addHeader(`Monthly Report: ${chunk.monthLabel} (Continued)`);
          sleepGraphY = 32;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text("Daily Sleep Tracker (Hours)", 14, sleepGraphY - 4);

      // Sleep Graph Axes
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.3);
      doc.line(marginX, sleepGraphY, marginX, sleepGraphY + graphHeight); // Y
      doc.line(marginX, sleepGraphY + graphHeight, marginX + graphWidth, sleepGraphY + graphHeight); // X

      // Y-Axis Labels (0 to 12 hours)
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text("12h", marginX - 2, sleepGraphY, { align: 'right' });
      doc.text("6h", marginX - 2, sleepGraphY + graphHeight/2, { align: 'right' });
      doc.text("0h", marginX - 2, sleepGraphY + graphHeight, { align: 'right' });

      // Plot Sleep Line
      doc.setDrawColor(6, 182, 212); // Cyan 500
      doc.setLineWidth(0.6);
      
      prevX = -1;
      prevY = -1;

      dates.forEach((date, i) => {
          const dateStr = formatDate(date);
          // Default to 6 hours (360 mins) if no data
          const minutes = sleepData[dateStr] !== undefined ? sleepData[dateStr] : 360;
          const hours = minutes / 60;
          const clampedHours = Math.min(Math.max(hours, 0), 12); // Clamp to 0-12 for graph

          const x = marginX + (i * xStep);
          const y = sleepGraphY + graphHeight - ((clampedHours / 12) * graphHeight);

          if (i > 0) doc.line(prevX, prevY, x, y);
          prevX = x;
          prevY = y;
          
          doc.setFillColor(6, 182, 212);
          doc.circle(x, y, 0.9, 'F');
          
          if (i % 2 === 0 || i === dates.length - 1) {
             doc.setFontSize(6);
             doc.setTextColor(100, 116, 139);
             doc.text(String(date.getDate()), x, sleepGraphY + graphHeight + 4, { align: 'center' });
          }
      });
  });

  // --- 4. Weekly Insights & Performance Graphs (New Page) ---
  doc.addPage();
  addHeader("Weekly Insights & Performance");
  
  // Calculate Weeks from dateArray
  const weeks: { start: Date, end: Date, label: string }[] = [];
  if (dateArray.length > 0) {
      let currentWeekDates: Date[] = [];
      dateArray.forEach((d, idx) => {
          const day = d.getDay();
          if (day === 1 && currentWeekDates.length > 0) {
              weeks.push({
                  start: currentWeekDates[0],
                  end: currentWeekDates[currentWeekDates.length - 1],
                  label: `Week ${weeks.length + 1}`
              });
              currentWeekDates = [];
          }
          currentWeekDates.push(d);
      });
      if (currentWeekDates.length > 0) {
          weeks.push({
              start: currentWeekDates[0],
              end: currentWeekDates[currentWeekDates.length - 1],
              label: `Week ${weeks.length + 1}`
          });
      }
  }

  // --- Graphical Performance for Individual Habits ---
  let startY = 32;
  const graphH = 25;
  const colWidth = (pageWidth - 28) / 2 - 10; // 2 cols
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text("Individual Habit Weekly Performance", 14, startY);
  startY += 10;

  habits.forEach((habit, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      
      const x = 14 + (col * (colWidth + 20));
      const y = startY + (row * (graphH + 20));

      // Check page break
      if (y + graphH > pageHeight - 20) {
          doc.addPage();
          addHeader("Weekly Insights & Performance (Continued)");
          startY = 32 - (row * (graphH + 20)); // Reset offset
      }

      // Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, colWidth, graphH + 10, 2, 2, 'FD');

      // Title
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(habit.name, x + 4, y + 6);

      // Mini Bar Chart
      const barAreaW = colWidth - 10;
      const barAreaH = graphH - 5;
      const barX = x + 5;
      const barY = y + 10;
      
      const barW = barAreaW / weeks.length;
      
      weeks.forEach((w, wIdx) => {
          // Calc stats
          let weekCompleted = 0;
          let weekDaysCount = 0;
          let d = new Date(w.start);
          while (d <= w.end) {
              weekDaysCount++;
              if (completions[habit.id]?.[formatDate(d)]) weekCompleted++;
              d.setDate(d.getDate() + 1);
          }
          const pct = weekDaysCount ? weekCompleted / weekDaysCount : 0;
          
          const h = pct * barAreaH;
          const bx = barX + (wIdx * barW) + (barW * 0.1);
          const bw = barW * 0.8;
          
          doc.setFillColor(HABIT_COLORS[idx % HABIT_COLORS.length]);
          doc.rect(bx, barY + barAreaH - h, bw, h, 'F');
          
          // Label
          doc.setFontSize(6);
          doc.setTextColor(100, 116, 139);
          doc.text(`W${wIdx+1}`, bx + bw/2, barY + barAreaH + 3, { align: 'center' });
          // Percentage top
          if (pct > 0) {
              doc.text(`${Math.round(pct*100)}%`, bx + bw/2, barY + barAreaH - h - 1, { align: 'center' });
          }
      });
  });

  // --- Sleep Analysis Graph (Weekly) ---
  const lastHabitY = startY + (Math.ceil(habits.length / 2) * (graphH + 20));
  let sleepY = lastHabitY + 10;
  
  if (sleepY + 40 > pageHeight - 10) {
      doc.addPage();
      addHeader("Weekly Insights & Performance (Continued)");
      sleepY = 32;
  }

  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text("Weekly Sleep Analysis (Average Hours)", 14, sleepY);

  const sleepGraphW = pageWidth - 28;
  const sleepGraphH = 40;
  
  // Axes
  doc.setDrawColor(71, 85, 105);
  doc.line(14, sleepY + 5, 14, sleepY + 5 + sleepGraphH);
  doc.line(14, sleepY + 5 + sleepGraphH, 14 + sleepGraphW, sleepY + 5 + sleepGraphH);

  const sleepBarW = sleepGraphW / weeks.length;
  
  weeks.forEach((w, wIdx) => {
      let totalMins = 0;
      let count = 0;
      let d = new Date(w.start);
      while (d <= w.end) {
          const m = sleepData[formatDate(d)];
          totalMins += (m !== undefined ? m : 360);
          count++;
          d.setDate(d.getDate() + 1);
      }
      const avgHours = count ? (totalMins / count) / 60 : 6;
      
      const h = (avgHours / 12) * sleepGraphH;
      const bx = 14 + (wIdx * sleepBarW) + (sleepBarW * 0.2);
      const bw = sleepBarW * 0.6;
      
      doc.setFillColor(6, 182, 212); // Cyan
      doc.rect(bx, sleepY + 5 + sleepGraphH - h, bw, h, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`Week ${wIdx+1}`, bx + bw/2, sleepY + 5 + sleepGraphH + 5, { align: 'center' });
      doc.text(`${avgHours.toFixed(1)}h`, bx + bw/2, sleepY + 5 + sleepGraphH - h - 2, { align: 'center' });
  });

  doc.save(`HabitFlow_Export_${formatDate(startDate)}_to_${formatDate(endDate)}.pdf`);
};