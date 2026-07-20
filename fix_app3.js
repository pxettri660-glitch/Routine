import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "jarvisTheme, setJarvisTheme, alarmTime, isAlarmEnabled",
  "jarvisTheme, setJarvisTheme, alarmTime, setAlarmTime, isAlarmEnabled, setIsAlarmEnabled"
);
fs.writeFileSync('src/App.tsx', content);

let codePractice = fs.readFileSync('src/components/CodePractice.tsx', 'utf-8');
codePractice = codePractice.replace(
  "useState<'dashboard' | 'problems' | 'learning'>('dashboard')",
  "useState<'dashboard' | 'problems' | 'workspace' | 'learning'>('dashboard')"
);
fs.writeFileSync('src/components/CodePractice.tsx', codePractice);

