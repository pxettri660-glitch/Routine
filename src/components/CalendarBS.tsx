import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// Accurate Conversions for AD to BS (2080-2085 BS)
export class NepaliDateConverter {
  static bsData: Record<number, { baisakh1: Date; lengths: number[] }> = {
    2080: { baisakh1: new Date(2023, 3, 14), lengths: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30] },
    2081: { baisakh1: new Date(2024, 3, 13), lengths: [31, 31, 32, 32, 31, 30, 30, 29, 30, 30, 30, 30] },
    2082: { baisakh1: new Date(2025, 3, 14), lengths: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
    2083: { baisakh1: new Date(2026, 3, 14), lengths: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 29, 30] },
    2084: { baisakh1: new Date(2027, 3, 14), lengths: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 29, 30] },
    2085: { baisakh1: new Date(2028, 3, 13), lengths: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30] }
  };

  static adToBs(date: Date) {
    const time = date.getTime();
    
    // Default fallback values if year out of bounds (approximate)
    let bsYear = date.getFullYear() + 57;
    let bsMonth = ((date.getMonth() + 8) % 12) + 1;
    let bsDay = date.getDate();

    // Find custom matching year
    const sortedYears = Object.keys(this.bsData).map(Number).sort((a, b) => b - a);
    
    for (const year of sortedYears) {
      const yearInfo = this.bsData[year];
      if (time >= yearInfo.baisakh1.getTime()) {
        bsYear = year;
        const diffTime = time - yearInfo.baisakh1.getTime();
        let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let monthIdx = 0;
        while (monthIdx < 12 && diffDays >= yearInfo.lengths[monthIdx]) {
          diffDays -= yearInfo.lengths[monthIdx];
          monthIdx++;
        }
        
        bsMonth = monthIdx + 1;
        bsDay = diffDays + 1;
        break;
      }
    }
    
    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay
    };
  }
}

export default function CalendarBS() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get first day of the current month (0-indexed, Sun-Sat)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Get total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Names of months in English
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Nepali months approximation corresponding roughly to the English months
  const nepaliMonthNames = [
    'Poush / Magh', 'Magh / Falgun', 'Falgun / Chaitra', 'Chaitra / Baishakh',
    'Baishakh / Jestha', 'Jestha / Ashadh', 'Ashadh / Shrawan', 'Shrawan / Bhadra',
    'Bhadra / Ashwin', 'Ashwin / Kartik', 'Kartik / Mangsir', 'Mangsir / Poush'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current real-world today properties
  const today = new Date();
  const isCurrentMonthAndYear = today.getFullYear() === year && today.getMonth() === month;

  // Render blank slots before the first day of the month
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => (
    <div key={`blank-${i}`} className="h-14 sm:h-16 bg-transparent" />
  ));

  // Render days with Gregorian date and Bikram Sambat overlay
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const isToday = isCurrentMonthAndYear && today.getDate() === day;
    
    // Precise AD to BS calculation
    const adDateOfCell = new Date(year, month, day);
    const bsOfCell = NepaliDateConverter.adToBs(adDateOfCell);

    return (
      <div
        key={`day-${day}`}
        className={`calendar-cell h-14 sm:h-16 flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 select-none ${
          isToday
            ? 'today bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-md shadow-emerald-500/5 font-extrabold'
            : 'bg-slate-950/20 border-slate-800/80 hover:border-slate-700 text-slate-350'
        }`}
      >
        <span className="text-xs sm:text-sm">{day}</span>
        <span className="nep-date text-[9px] text-amber-500 font-bold self-end tracking-wider">
          {bsOfCell.day}/{bsOfCell.month}
        </span>
      </div>
    );
  });

  // Calculate current middle of the month BS date for title
  const midIndex = Math.floor(totalDays / 2) || 15;
  const midBs = NepaliDateConverter.adToBs(new Date(year, month, midIndex));

  // Calculation for today in AD/BS for widgets
  const bsToday = NepaliDateConverter.adToBs(today);
  const formattedTodayBS = `${bsToday.year}/${String(bsToday.month).padStart(2, '0')}/${String(bsToday.day).padStart(2, '0')}`;
  const formattedTodayAD = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* View Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-sky-400 w-5 h-5" />
            DUAL CALENDAR MATRIX
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dual chronological scheduler layering English (AD) and Bikram Sambat (नेपाल सम्बत - BS) blocks.
          </p>
        </div>

        {/* Current Date Details Widget mirroring requested strings */}
        <div className="flex flex-col gap-1 text-xs border border-slate-800 bg-slate-950/40 p-2.5 sm:px-4 sm:py-2 rounded-xl text-slate-350 font-mono">
          <div>📅 AD: {formattedTodayAD}</div>
          <div>🇳🇵 BS: {formattedTodayBS}</div>
        </div>

        {/* Month Selector navigation */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 w-fit">
          <button
            onClick={handlePrevMonth}
            className="p-1 px-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span id="calendar-month-year" className="text-xs font-bold text-sky-400 uppercase tracking-widest px-2.5 min-w-[200px] text-center font-mono">
            {monthNames[month]} {year} AD | {midBs.year} BS
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 px-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Calendar Main Grid Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-sky-500/20">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-300">
              {monthNames[month]} Calendar Grid
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mt-0.5">
              Approximate Nepali Month range: <span className="text-amber-500 font-bold">{nepaliMonthNames[month]}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono border border-slate-800 bg-slate-950/40 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Nepal BS Date Syncing On
          </div>
        </div>

        {/* Days of week columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={`dow-${day}`}
              className="text-xs font-extrabold uppercase tracking-widest text-sky-400 py-2.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {blankDays}
          {daysInMonth}
        </div>
      </div>
    </div>
  );
}
