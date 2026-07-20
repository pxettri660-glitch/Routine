import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldDash = "<Dashboard currentTime={currentTime} currentTask={activeTask} taskProgress={taskProgress} goals={goals} alarmTime={alarmTime} isAlarmEnabled={isAlarmEnabled} onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)} onSetAlarmTime={setAlarmTime} />";
const newDash = "<Dashboard currentTime={currentTime} currentTask={activeTask} taskProgress={taskProgress} goals={goals} alarmTime={alarmTime} isAlarmEnabled={isAlarmEnabled} onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)} onSetAlarmTime={setAlarmTime} triggerBuzzerDemo={() => playSoundAlarmBeep()} triggerVoiceDemo={() => speakVoiceAnnouncement('Demo announcement')} onNavigate={handleNavigate} onAwardXP={handleAwardXP} xpHistory={xpHistory} />";

content = content.replace(new RegExp(oldDash.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), newDash);
fs.writeFileSync('src/App.tsx', content);
