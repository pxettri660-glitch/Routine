import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace("import CommunityNav from './components/community/CommunityNav';", "import CommunityNav from './components/CommunityNav';");
content = content.replace("import CodePractice from './components/code-practice/CodePractice';", "import CodePractice from './components/CodePractice';");

content = content.replace(
  "const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);",
  "const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);\n  const [isPlaying, setIsPlaying] = useState<boolean>(false);"
);

const dashboardReplace = "<Dashboard currentTime={currentTime} currentTask={activeTask} taskProgress={taskProgress} goals={goals} alarmTime={alarmTime} isAlarmEnabled={isAlarmEnabled} onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)} onSetAlarmTime={setAlarmTime} />";
content = content.replace(/<Dashboard currentTime=\{currentTime\} currentTask=\{activeTask\} taskProgress=\{taskProgress\} goals=\{goals\} \/>/g, dashboardReplace);

const musicReplace = "<Entertainment loadedTracks={loadedTracks} onUploadTracks={setLoadedTracks} audioElementRef={audioElementRef} currentTrackIndex={currentTrackIndex} setCurrentTrackIndex={setCurrentTrackIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />";
content = content.replace(/<Entertainment [^>]*\/>/g, musicReplace);

fs.writeFileSync('src/App.tsx', content);
