import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const CalendarBS = React.memo(function CalendarBS() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [direction, setDirection] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const nepaliMonthNames = [
    'Poush / Magh', 'Magh / Falgun', 'Falgun / Chaitra', 'Chaitra / Baishakh',
    'Baishakh / Jestha', 'Jestha / Ashadh', 'Ashadh / Shrawan', 'Shrawan / Bhadra',
    'Bhadra / Ashwin', 'Ashwin / Kartik', 'Kartik / Mangsir', 'Mangsir / Poush'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isCurrentMonthAndYear = today.getFullYear() === year && today.getMonth() === month;

  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => (
    <div key={`blank-${i}`} className="aspect-square sm:h-20 bg-transparent" />
  ));

  const daysInMonth = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const isToday = isCurrentMonthAndYear && today.getDate() === day;
    
    const adDateOfCell = new Date(year, month, day);
    const bsOfCell = NepaliDateConverter.adToBs(adDateOfCell);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        key={`day-${day}`}
        className={`relative aspect-square sm:h-20 flex flex-col justify-between p-2 sm:p-3 rounded-2xl sm:rounded-[1.5rem] border transition-all duration-300 select-none cursor-pointer group ${
          isToday
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-400/50 shadow-lg shadow-indigo-500/25 text-white'
            : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/10'
        }`}
      >
        <span className={`text-sm sm:text-lg font-bold ${isToday ? '' : 'opacity-80'}`}>{day}</span>
        <span className={`text-[9px] sm:text-[11px] font-bold self-end tracking-widest ${isToday ? 'text-white/80' : 'text-orange-500 dark:text-amber-500 opacity-80'}`}>
          {bsOfCell.day}/{bsOfCell.month}
        </span>
      </motion.div>
    );
  });

  const midIndex = Math.floor(totalDays / 2) || 15;
  const midBs = NepaliDateConverter.adToBs(new Date(year, month, midIndex));

  const bsToday = NepaliDateConverter.adToBs(today);
  const formattedTodayBS = `${bsToday.year}/${String(bsToday.month).padStart(2, '0')}/${String(bsToday.day).padStart(2, '0')}`;
  const formattedTodayAD = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-sky-500" />
            Calendar
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">Dual Chronological Matrix</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5 text-right font-mono text-xs opacity-70 border-r border-black/10 dark:border-white/10 pr-4">
            <span>{formattedTodayAD}</span>
            <span className="text-amber-600 dark:text-amber-400">🇳🇵 {formattedTodayBS}</span>
          </div>

          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-black/5 dark:border-white/10">
            <button
              onClick={handlePrevMonth}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-40 sm:w-48 text-center font-bold text-sm tracking-wider overflow-hidden">
               <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={month + year}
                    initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  >
                    {monthNames[month]} {year}
                  </motion.div>
               </AnimatePresence>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5 dark:border-white/10 relative z-10">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">
              {monthNames[month]} Calendar
            </h3>
            <span className="text-xs opacity-50 block mt-1">
              Nepali Range: <span className="text-amber-600 dark:text-amber-400 font-bold">{nepaliMonthNames[month]}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" /> Region: Nepal (BS)
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center mb-3">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={month + year}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-7 gap-2 sm:gap-3"
            >
              {blankDays}
              {daysInMonth}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

export default CalendarBS;
