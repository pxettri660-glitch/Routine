export const getMinutesOfDay = (hhmmStr: string): number => {
  const [h, m] = hhmmStr.split(':').map(Number);
  return h * 60 + m;
};

export const isTaskActive = (start: string, end: string, date: Date): boolean => {
  const currentMins = date.getHours() * 60 + date.getMinutes();
  const startMins = getMinutesOfDay(start);
  const endMins = getMinutesOfDay(end);

  if (startMins < endMins) {
    return currentMins >= startMins && currentMins < endMins;
  } else {
    // Midnight wrap-around item
    return currentMins >= startMins || currentMins < endMins;
  }
};
