import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, Bot, User, Volume2, Sparkles, AlertCircle, 
  Layers, Globe, Cpu, BookOpen, Calendar, TrendingUp, 
  Trash2, Play, Square, FileText, Check, Zap, Timer, HelpCircle, 
  Activity, Award, Compass, Search, Wand2, Paperclip, CheckSquare,
  Mic, MicOff
} from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: string;
}

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  completed: boolean;
}

interface ReminderItem {
  id: string;
  text: string;
  time: string;
  completed: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface StudyHoursRecord {
  day: string;
  hours: number;
  goalCompletion?: number;
}

interface JarvisProps {
  onNavigate: (viewId: string) => void;
  selectedTheme: 'cyan' | 'red' | 'purple';
  onChangeTheme: (theme: 'cyan' | 'red' | 'purple') => void;
  isThemeLight?: boolean;
  onToggleLightDarkTheme?: () => void;
}

export default function Jarvis({ 
  onNavigate, 
  selectedTheme, 
  onChangeTheme,
  isThemeLight,
  onToggleLightDarkTheme
}: JarvisProps) {
  // General view tabs
  const [activeTab, setActiveTab] = useState<'cockpit' | 'study' | 'scheduler' | 'analytics' | 'docai'>('cockpit');

  // Core Chat & Wake States
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('jarvis_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jarvis_chat_messages', JSON.stringify(messages));
  }, [messages]);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [statusText, setStatusText] = useState('OFFLINE (MIC MUTED)');
  const [statusColor, setStatusColor] = useState('text-rose-450');
  const [voiceModel, setVoiceModel] = useState<'male' | 'female'>('male');
  const [agentType, setAgentType] = useState<'general' | 'teacher' | 'coder' | 'planner' | 'research' | 'motivator'>('general');
  const [enableInternetSearch, setEnableInternetSearch] = useState(false);
  const [enableOllama, setEnableOllama] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sysLogs, setSysLogs] = useState<string[]>(['[COGNITIVE HUB] Init sequence...', '[STARK CORE] Quantum security active.']);

  // Multimodal OCR Camera Vision state
  const [attachedImage, setAttachedImage] = useState<{ name: string; mimeType: string; data: string } | null>(null);

  // Homeworks, countdown, reminders persistence states
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [examCountdown, setExamCountdown] = useState({ title: 'Physics Final Boards', date: '2026-07-05' });
  const [daysRemaining, setDaysRemaining] = useState(12);

  // Study Hours Analytics state
  const [studySessionActive, setStudySessionActive] = useState(false);
  const [studySecondsElapsed, setStudySecondsElapsed] = useState(0);
  const [weeklyStudyTracker, setWeeklyStudyTracker] = useState<StudyHoursRecord[]>([
    { day: 'Mon', hours: 3.5, goalCompletion: 80 },
    { day: 'Tue', hours: 4.8, goalCompletion: 95 },
    { day: 'Wed', hours: 2.1, goalCompletion: 60 },
    { day: 'Thu', hours: 5.4, goalCompletion: 100 },
    { day: 'Fri', hours: 4.0, goalCompletion: 85 },
    { day: 'Sat', hours: 6.2, goalCompletion: 100 },
    { day: 'Sun', hours: 3.0, goalCompletion: 70 }
  ]);

  // Dynamic Interactive MCQ Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Local document/notes AI Text Summarizer states
  const [rawDocumentText, setRawDocumentText] = useState('');
  const [docSummaryOutput, setDocSummaryOutput] = useState('');
  const [docSummaryLoading, setDocSummaryLoading] = useState(false);

  // Core state storage refs
  const historyInputRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Wake and voice active state control refs
  const isUserEnabledVoiceRef = useRef<boolean>(false);
  const isWaitingForCommandRef = useRef<boolean>(false);
  const wakeTimeoutRef = useRef<any>(null);
  const processVoiceInputRef = useRef<any>(null);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('jarvis_history_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Clock calculations for exams
  useEffect(() => {
    try {
      const examDate = new Date(examCountdown.date);
      const today = new Date();
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays > 0 ? diffDays : 0);
    } catch {}
  }, [examCountdown]);

  // Sync vocal processing reference
  useEffect(() => {
    processVoiceInputRef.current = processVoiceInput;
  });

  // Sync stopwatch timer logic
  useEffect(() => {
    let stopwatch: any = null;
    if (studySessionActive) {
      stopwatch = setInterval(() => {
        setStudySecondsElapsed(s => s + 1);
      }, 1000);
    } else {
      clearInterval(stopwatch);
    }
    return () => clearInterval(stopwatch);
  }, [studySessionActive]);

  // Sync logs trigger outputs
  const pushLog = (txt: string) => {
    setSysLogs(prev => [`[${new Date().toLocaleTimeString()}] ${txt}`, ...prev.slice(0, 15)]);
  };

  // Fetch /api/memory on Mount to fully synchronize database
  useEffect(() => {
    async function loadBackendDB() {
      try {
        pushLog('Coupling network database channels...');
        const res = await fetch('/api/memory');
        if (res.ok) {
          const db = await res.json();
          pushLog('Database sync complete. Memory recovered.');
          if (db.homeworkTracker && db.homeworkTracker.length > 0) setHomeworks(db.homeworkTracker);
          if (db.reminders && db.reminders.length > 0) setReminders(db.reminders);
          if (db.studyHoursTracker && db.studyHoursTracker.length > 0) setWeeklyStudyTracker(db.studyHoursTracker);
          if (db.examDetails) setExamCountdown(db.examDetails);
        }
      } catch (err) {
        console.warn('Backend database coupling offline, using client fallback.', err);
        pushLog('Memory engine utilizing LocalStorage container.');
      }
    }
    loadBackendDB();
  }, []);

  // Save specific parameters back to /api/memory
  const syncToBackendDB = async (updates: any) => {
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {}
  };

  // Scroll to bottom on Chat message streams
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, activeTab]);

  // OCR visual scanning image file upload trigger
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage({
        name: file.name,
        mimeType: file.type,
        data: reader.result as string
      });
      pushLog(`Vision scanner appended attachment: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Setup Continuous speech wake-word recognition structure
  useEffect(() => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechClass) {
      setIsSpeechAvailable(true);
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        console.log('[JARVIS VOICE DETECTED]:', text);
        if (processVoiceInputRef.current) {
          processVoiceInputRef.current(text);
        }
      };

      rec.onstart = () => {
        setIsListening(true);
        if (isWaitingForCommandRef.current) {
          setStatusText('LISTENING FOR COMMAND...');
          setStatusColor('text-purple-400');
        } else {
          setStatusText("IDLE - SAY 'HEY JARVIS'");
          setStatusColor('text-sky-400');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (isUserEnabledVoiceRef.current) {
          try {
            rec.start();
          } catch (e) {
            console.warn('Continuous restart error:', e);
          }
        } else {
          setStatusText('OFFLINE (MIC MUTED)');
          setStatusColor('text-rose-450');
        }
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition interface error:', err);
        setIsListening(false);
        if (isUserEnabledVoiceRef.current) {
          setTimeout(() => {
            if (isUserEnabledVoiceRef.current) {
              try { rec.start(); } catch {}
            }
          }, 1000);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const speakNarrative = (msgText: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msgText.replace(/[*#`_\-]/g, ''));
        utterance.rate = 1.05;
        utterance.volume = 1.0;

        try {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => 
            v.name.includes('Google') || v.name.includes('Microsoft')
          );
          if (preferredVoice) utterance.voice = preferredVoice;
        } catch {}

        if (voiceModel === 'female') {
          utterance.pitch = 1.15; // Friday voice representation
        } else {
          utterance.pitch = 0.95; // Jarvis voice representation
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Vocal engine block:', e);
        setIsSpeaking(false);
      }
    }
  };

  const playJarvisStartSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (e) {
      console.warn('Sound synthetics blocked:', e);
    }
  };

  // Perform Gemini AI request proxy (with Agent selector, internet grounding option and Camera Vision)
  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-u`,
      role: 'user',
      content: query || '[Vision Camera Data Attached]',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);
    setStatusText('JARVIS SYNTHESIZING...');
    setStatusColor('text-amber-400');
    pushLog(`Command dispatch: "${query.substring(0, 30)}..."`);

    const newHistoryItem: HistoryItem = {
      id: `h-${Date.now()}`,
      query: query || 'Image Payload',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    localStorage.setItem('jarvis_history_items', JSON.stringify(updatedHistory));

    try {
      let botReply = '';

      // Determine if running local AI via Ollama Proxy
      if (enableOllama) {
        pushLog(`Routing command to Local Ollama at ${ollamaUrl}...`);
        const res = await fetch('/api/ollama/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            ollamaUrl,
            model: ollamaModel,
            history: messages.map(m => ({ role: m.role, content: m.content }))
          })
        });
        const rdata = await res.json();
        if (rdata.error) throw new Error(rdata.error);
        botReply = rdata.text;
      } else {
        // Run secure full-stack secure backend cloud router
        const historyPayload = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            history: historyPayload,
            agentType,
            enableSearch: enableInternetSearch,
            image: attachedImage
          }),
        });

        const rdata = await res.json();
        if (rdata.error) throw new Error(rdata.error);
        botReply = rdata.text;
      }

      setIsThinking(false);
      setStatusText('SYSTEM ONLINE');
      setStatusColor('text-emerald-400');
      pushLog('Response decoded successfully.');

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}-a`,
        role: 'assistant',
        content: botReply,
        agentType
      };

      setMessages(prev => [...prev, botMsg]);
      // Clear OCR attachment after reading
      setAttachedImage(null);
      speakNarrative(botReply);

    } catch (err: any) {
      console.error(err);
      setIsThinking(false);
      setStatusText('INTERFACE ERROR');
      setStatusColor('text-rose-500');
      pushLog(`Cognitive link aborted: ${err.message}`);

      const errBotMsg: ChatMessage = {
        id: `m-${Date.now()}-err`,
        role: 'assistant',
        content: `Sir, I encountered a communication blockage: ${err.message || 'Server timeout'}. Please verify connection integrity and model server settings.`
      };
      setMessages(prev => [...prev, errBotMsg]);
    }
  };

  // Core Voice navigation intercepts
  const handleVoiceCommand = (cmd: string): boolean => {
    pushLog(`Voice syntax parse: "${cmd}"`);
    if (cmd.includes('open jarvis')) {
      speakNarrative('Opening cockpit dashboard console.');
      setActiveTab('cockpit');
      return true;
    }
    if (cmd.includes('open study') || cmd.includes('open quiz') || cmd.includes('math solver') || cmd.includes('chemistry solver') || cmd.includes('pcm list')) {
      speakNarrative('Opening study coach solvers & interactive quiz module.');
      setActiveTab('study');
      return true;
    }
    if (cmd.includes('open schedules') || cmd.includes('open schedule') || cmd.includes('open calendar') || cmd.includes('open routine') || cmd.includes('open timetable')) {
      speakNarrative('Loading schedule timers, board count-downs and daily timetables.');
      setActiveTab('scheduler');
      return true;
    }
    if (cmd.includes('open analytics') || cmd.includes('open chart') || cmd.includes('show report') || cmd.includes('open study hours')) {
      speakNarrative('Displaying study chronometers, milestone achievements and report graphs.');
      setActiveTab('analytics');
      return true;
    }
    if (cmd.includes('open document ai') || cmd.includes('open note summarizer') || cmd.includes('open pdf')) {
      speakNarrative('Activating text models, note summarized tools, and OCR extraction platforms.');
      setActiveTab('docai');
      return true;
    }
    if (cmd.includes('clear chat') || cmd.includes('new session') || cmd.includes('reset console')) {
      setMessages([]);
      speakNarrative('Command session wiped clean.');
      return true;
    }
    return false;
  };

  const processVoiceInput = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    
    // Waiting for direct input command
    if (isWaitingForCommandRef.current) {
      if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
      isWaitingForCommandRef.current = false;
      setStatusText("IDLE - SAY 'HEY JARVIS'");
      setStatusColor('text-sky-400');

      const handled = handleVoiceCommand(text);
      if (!handled) {
        sendMessage(rawText);
      }
      return;
    }

    // Wake word validation
    const lowercaseText = text.toLowerCase();
    const wakeIndexCyan = lowercaseText.indexOf('hey jarvis');
    const wakeIndexRed = lowercaseText.indexOf('hi jarvis');
    
    let wakeIndex = -1;
    let wakeLength = 10;
    if (wakeIndexCyan !== -1) {
      wakeIndex = wakeIndexCyan;
      wakeLength = 10;
    } else if (wakeIndexRed !== -1) {
      wakeIndex = wakeIndexRed;
      wakeLength = 9;
    }

    if (wakeIndex !== -1) {
      playJarvisStartSound();
      speakNarrative("Yes Prince, I'm listening.");

      const commandPart = text.substring(wakeIndex + wakeLength).trim();

      if (commandPart.length > 0) {
        setStatusText('EXECUTING COMMAND...');
        setStatusColor('text-amber-400');
        setTimeout(() => {
          const handled = handleVoiceCommand(commandPart);
          if (!handled) {
            sendMessage(commandPart);
          }
          setStatusText("IDLE - SAY 'HEY JARVIS'");
          setStatusColor('text-sky-400');
        }, 1200);
      } else {
        isWaitingForCommandRef.current = true;
        setStatusText('LISTENING FOR COMMAND...');
        setStatusColor('text-purple-400');
        
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        wakeTimeoutRef.current = setTimeout(() => {
          if (isWaitingForCommandRef.current) {
            isWaitingForCommandRef.current = false;
            setStatusText("IDLE - SAY 'HEY JARVIS'");
            setStatusColor('text-sky-400');
            speakNarrative('Going standby.');
          }
        }, 8000);
      }
    }
  };

  const handleMicTrigger = () => {
    if (!recognitionRef.current) return;
    if (isListening || isUserEnabledVoiceRef.current) {
      isUserEnabledVoiceRef.current = false;
      isWaitingForCommandRef.current = false;
      if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
      try {
        recognitionRef.current.stop();
      } catch {}
      speakNarrative('Voice subsystem standby.');
      setStatusText('OFFLINE (MIC MUTED)');
      setStatusColor('text-rose-450');
      pushLog('Acoustic wake-engine deactivated.');
    } else {
      isUserEnabledVoiceRef.current = true;
      isWaitingForCommandRef.current = false;
      playJarvisStartSound();
      speakNarrative('Jarvis voice system activated. Directives standby.');
      setStatusText("IDLE - SAY 'HEY JARVIS'");
      setStatusColor('text-sky-400');
      pushLog('Mic listening activated. Say "Hey Jarvis" to command.');
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const exportChatHistory = () => {
    try {
      const dataStr = JSON.stringify(messages, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jarvis_chat_history_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      pushLog('Chat history exported successfully.');
    } catch (e) {
      console.error('Error exporting chat history:', e);
      pushLog('Failed to export chat logs.');
    }
  };

  // 5. AI Study Coach solver templates trigger macro
  const runStudySolverTemplate = (subject: string, question: string) => {
    setInputVal(`Act as my study agent. Run analysis on this ${subject} question and provide step-by-step derivational proofs:\n"${question}"`);
    setActiveTab('cockpit');
    speakNarrative(`Loading ${subject} cognitive solvers template, hit send to analyze, Prince.`);
  };

  // Dynamic MCQ Generator triggered locally (no third-party quiz dependencies)
  const generateInteractiveQuiz = () => {
    pushLog('Assembling quantum quiz metrics...');
    const questionsPool: QuizQuestion[] = [
      {
        question: 'Which of the following describes the thermodynamic behavior of an isolated system?',
        options: ['Exchanges energy only', 'Exchanges matter only', 'Exchanges neither energy nor matter with surroundings', 'Exchanges both freely'],
        answerIndex: 2,
        explanation: 'An isolated system cannot share heat, work, or compounds outside its perimeter, preserving absolute internal thermodynamic structures.'
      },
      {
        question: 'Solve for limits: lim (x -> 0) [sin(x) / x]',
        options: ['0', '1', 'Undefined', 'Infinity'],
        answerIndex: 1,
        explanation: 'According to Squeeze Theorem or LHospitals rule, evaluating the derivative of numerator and denominator reveals limit evaluates to 1.'
      },
      {
        question: 'Calculate equivalent resistance for three 10 Ohm resistors wired in parallel.',
        options: ['30 Ohm', '3.33 Ohm', '0.3 Ohm', '15 Ohm'],
        answerIndex: 1,
        explanation: 'Using formula 1/Req = 1/R1 + 1/R2 + 1/R3, Req computes to 10/3 = 3.33 Ohms.'
      },
      {
        question: 'What orbital hybridization occurs in a carbon atom on methane (CH4)?',
        options: ['sp', 'sp2', 'sp3', 'dsp2'],
        answerIndex: 2,
        explanation: 'Methane has 4 single bonds forming a symmetrical tetrahedral spatial orientation, calling for complete sp3 orbital coordination.'
      },
      {
        question: 'Identify the derivative of e^(2x) relative to x.',
        options: ['e^(2x)', '2 e^(2x)', '1/2 e^(2x)', '2x e^(2x-1)'],
        answerIndex: 1,
        explanation: 'Utilizing chain rules, the external derivative evaluates to 2 multiplied by original exponential e^(2x).'
      }
    ];

    setQuizQuestions(questionsPool);
    setQuizActive(true);
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setQuizFeedback(null);
    speakNarrative('Let us test PCM metrics Prince, select correct choices to verify knowledge.');
  };

  const submitQuizChoice = (idx: number) => {
    const isCorrect = idx === quizQuestions[currentQuizIdx].answerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      setQuizFeedback('✅ CORRECT - Absolute genius calculation, Sir!');
    } else {
      setQuizFeedback(`❌ INCORRECT - Formula mismatch. Solution: ${quizQuestions[currentQuizIdx].options[quizQuestions[currentQuizIdx].answerIndex]}`);
    }
  };

  const advanceQuiz = () => {
    setQuizFeedback(null);
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      // Quiz complete! Reward XP
      setQuizActive(false);
      const totalXPBonus = quizScore * 50;
      pushLog(`Study Quiz finalized. Gained +${totalXPBonus} Focus XP.`);
      speakNarrative(`Excellent session Prince. You secured ${quizScore} out of 5 points, awarding you ${totalXPBonus} focus experience points.`);
      alert(`📚 QUIZ METRICS COMPLETE!\nScore: ${quizScore}/5\nReward: +${totalXPBonus} XP has been bestowed to Prince!`);
    }
  };

  // 7. Scheduler actions
  const addHomework = (title: string, subject: string, deadline: string) => {
    if (!title.trim() || !subject.trim()) return;
    const newItem: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title,
      subject,
      deadline: deadline || new Date().toISOString().split('T')[0],
      completed: false
    };
    const updated = [newItem, ...homeworks];
    setHomeworks(updated);
    syncToBackendDB({ homeworkTracker: updated });
    pushLog(`Academic homework assigned: ${title}`);
  };

  const toggleHomeworkCompleted = (id: string) => {
    const updated = homeworks.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHomeworks(updated);
    syncToBackendDB({ homeworkTracker: updated });
    pushLog('Homework status toggled.');
  };

  const deleteHomework = (id: string) => {
    const updated = homeworks.filter(h => h.id !== id);
    setHomeworks(updated);
    syncToBackendDB({ homeworkTracker: updated });
  };

  const triggerAutoTimetableGenerator = () => {
    pushLog('Synthesizing optimized timetable models...');
    setInputVal('Generate an optimal, highly productive 24-hour study schedule block designed specifically to balance PCM board study, logic coding drills, short exercises and healthy sleep cycles.');
    setActiveTab('cockpit');
    setAgentType('planner');
    speakNarrative('Optimizing study coordinates. Hit send to compile scheduler routines.');
  };

  const addReminder = (text: string, time: string) => {
    if (!text.trim() || !time.trim()) return;
    const newItem: ReminderItem = {
      id: `rem-${Date.now()}`,
      text,
      time,
      completed: false
    };
    const updated = [newItem, ...reminders];
    setReminders(updated);
    syncToBackendDB({ reminders: updated });
    pushLog(`Micro timer set: "${text}" at ${time}`);
    
    // Auto voice alert after timeout simulation
    try {
      const [hrs, mins] = time.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hrs, mins, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff < 0) diff += 24 * 60 * 60 * 1000; // tomorrow
      
      setTimeout(() => {
        speakNarrative(`Sir, crucial reminder parameter triggered: ${text}`);
        alert(`🔔 JARVIS ALERT: ${text}`);
      }, Math.min(diff, 60000)); // cap simulated alert test to 60s
    } catch {}
  };

  // 8. Productivity analytics hour tracker stopwatch
  const toggleStudyStopwatch = () => {
    if (studySessionActive) {
      // Stopped study session! Calculate study hours and append to statistics state
      const hrsStudied = parseFloat((studySecondsElapsed / 3600).toFixed(4));
      const minsStudied = Math.ceil(studySecondsElapsed / 60);
      const xpEarned = minsStudied * 10;

      // Update current day in chart logs
      const updatedTracker = [...weeklyStudyTracker];
      const todayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
      const dayRecIdx = updatedTracker.findIndex(t => t.day === todayShort);
      if (dayRecIdx !== -1) {
        updatedTracker[dayRecIdx].hours = parseFloat((updatedTracker[dayRecIdx].hours + hrsStudied).toFixed(1));
        // Optionally update goalCompletion based on new hours, or just leave it
      } else {
        updatedTracker.push({ day: todayShort, hours: parseFloat(hrsStudied.toFixed(1)), goalCompletion: 50 });
      }
      setWeeklyStudyTracker(updatedTracker);
      syncToBackendDB({ studyHoursTracker: updatedTracker });

      // Notify completion
      pushLog(`Stopwatch locked. Focused minutes: ${minsStudied}. Gained +${xpEarned} analytical XP.`);
      speakNarrative(`Session terminated Prince. You focus-trained for ${minsStudied} minutes, rewarding you ${xpEarned} focus parameters.`);
      alert(`⏱️ CHRONO STUDY TARGET REPORT:\nDuration: ${minsStudied} min\nReward: +${xpEarned} XP applied.`);
      setStudySessionActive(false);
      setStudySecondsElapsed(0);
    } else {
      setStudySessionActive(true);
      setStudySecondsElapsed(0);
      speakNarrative('Chronometer activated, Sir. Focus block is now live.');
      pushLog('Study timer activated.');
    }
  };

  const formatStopwatchTime = (totSeconds: number) => {
    const hrs = Math.floor(totSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // 9. Document / PDF text summaries
  const executePDFNoteSummary = async (mode: 'summarize' | 'formulas' | 'mcqs') => {
    if (!rawDocumentText.trim()) {
      alert('Sir, please paste document text first before compiling operations.');
      return;
    }
    setDocSummaryLoading(true);
    setDocSummaryOutput('');
    pushLog('Pumping note content into cognitive summaries parser...');

    let actionPrompt = '';
    if (mode === 'summarize') {
      actionPrompt = `Compress this reference material into an elegant, bulleted study brief. Focus strictly on definitions, core rules, and fundamental theories:\n\n${rawDocumentText}`;
    } else if (mode === 'formulas') {
      actionPrompt = `Extract every crucial Physics, Chemistry, and Math equation, symbol, and proof mechanism into a neat formula card layout:\n\n${rawDocumentText}`;
    } else {
      actionPrompt = `Synthesize 3 challenging high-level Multiple Choice Questions Based on these resources, detailing options A, B, C, D and explicit theoretical explanations for scientific mastery:\n\n${rawDocumentText}`;
    }

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: actionPrompt,
          history: [],
          agentType: 'teacher'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDocSummaryOutput(data.text);
      setDocSummaryLoading(false);
      pushLog('Note compilation complete.');
      speakNarrative('Reference analysis completed Prince, displaying synthesized material logs.');
    } catch (err: any) {
      console.error(err);
      setDocSummaryLoading(false);
      setDocSummaryOutput(`Document AI interface faulted: ${err.message}`);
    }
  };

  const getDynamicStatusIndicator = () => {
    if (isSpeaking) return "🔊 Speaking";
    if (isThinking) return "🧠 Thinking";
    if (isWaitingForCommandRef.current) return "🎤 Listening";
    if (isListening) return "🟢 Standby"; // Continuously Listening Wake Word active
    if (!isUserEnabledVoiceRef.current) return "🔴 Offline";
    return "🟢 Standby";
  };

  return (
    <div className="h-[84vh] flex flex-col md:flex-row bg-[#020512] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl relative font-sans text-slate-350">
      
      {/* Dynamic Cyber Tech Sidebar and Controls layout */}
      <div className="w-full md:w-72 bg-gradient-to-b from-slate-950/95 to-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Iron Man Reactor Glow Brand logo */}
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3 relative">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center relative group transition-all duration-300 ${
              selectedTheme === 'cyan' ? 'border-sky-500/50 bg-sky-950/20 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]' :
              selectedTheme === 'red' ? 'border-rose-500/50 bg-rose-950/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
              'border-violet-500/50 bg-violet-950/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
            }`}>
              <div className="absolute inset-1 rounded-full border border-dashed border-current opacity-60 animate-spin-slow duration-10000" />
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-widest uppercase text-white font-mono flex items-center gap-1">
                JARVIS <span className="text-[10px] text-sky-400 font-extrabold px-1.5 py-0.5 bg-sky-500/10 rounded-md">X</span>
              </h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-mono">
                AI OPERATING SYSTEM
              </p>
            </div>
          </div>

          {/* Quick HUD Navigation tabs */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'cockpit' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.05)]' 
                  : 'text-slate-400 border border-transparent hover:bg-slate-900 status-cell'
              }`}
            >
              <Cpu className="w-4 h-4" /> CMD Cockpit
            </button>

            <button
              onClick={() => setActiveTab('study')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'study' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 border border-transparent hover:bg-slate-900 status-cell'
              }`}
            >
              <BookOpen className="w-4 h-4" /> AI Study Coach
            </button>

            <button
              onClick={() => setActiveTab('scheduler')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'scheduler' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 border border-transparent hover:bg-slate-900 status-cell'
              }`}
            >
              <Calendar className="w-4 h-4" /> Smart Scheduler
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 border border-transparent hover:bg-slate-900 status-cell'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Focus Reports
            </button>

            <button
              onClick={() => setActiveTab('docai')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'docai' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 border border-transparent hover:bg-slate-900 status-cell'
              }`}
            >
              <FileText className="w-4 h-4" /> Notes & PDF AI
            </button>
          </div>

          {/* Wake Word trigger micro widget */}
          <div className="p-3 bg-slate-950/45 border border-slate-800/80 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 select-none">
              <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase">
                Acoustic Voice Wake
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${isListening ? 'bg-sky-400 animate-ping' : 'bg-rose-500'}`} />
            </div>
            <button
              id="voice-wake-trigger-btn"
              onClick={handleMicTrigger}
              className={`w-full py-2 px-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-rose-500/15 border border-rose-500/35 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {isListening ? "🎙️ CONTINUOUS ACTIVE (HEY JARVIS)" : "🔇 MUTED - IGNITE MIC"}
            </button>
          </div>

        </div>

        {/* Console logs ticker element */}
        <div className="space-y-2.5 border-t border-slate-800/80 pt-3">
          <div className="flex justify-between text-[9px] font-mono tracking-widest text-slate-500 font-bold uppercase select-none">
            <span>OS Core Logs</span>
            <span className="text-[8px] text-sky-500">v10.5.2</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 h-28 overflow-y-auto no-scrollbar font-mono text-[9px] text-[#bc9eff60] space-y-1">
            {sysLogs.map((log, lidx) => (
              <div key={lidx} className="truncate select-none">{log}</div>
            ))}
          </div>

          {/* Quick theme toggles */}
          <div className="flex items-center justify-between gap-2.5 pt-1.5">
            <select
              value={selectedTheme}
              onChange={(e) => onChangeTheme(e.target.value as any)}
              className="flex-1 h-7 border border-slate-850 rounded-lg bg-slate-950 text-slate-400 text-[10px] px-1.5 outline-none cursor-pointer focus:border-sky-500 font-mono uppercase font-bold"
            >
              <option value="cyan">Cyber Cyan</option>
              <option value="red">Stark Red</option>
              <option value="purple">Quantum Violet</option>
            </select>
            <select
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value as any)}
              className="flex-1 h-7 border border-slate-850 rounded-lg bg-slate-950 text-slate-400 text-[10px] px-1.5 outline-none cursor-pointer focus:border-sky-500 font-mono uppercase font-bold"
            >
              <option value="male">Jarvis Male</option>
              <option value="female">Friday Fem</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary HUD Viewports container */}
      <div className="flex-1 flex flex-col h-full bg-[#030610]/95 backdrop-blur-3xl relative justify-between overflow-hidden">
        
        {/* Secondary System Status Indicators */}
        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/40 backdrop-blur pointer-events-auto select-none z-10">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-slate-400 tracking-widest uppercase">
              JARVIS COCKPIT ENGINE // STATUS: {getDynamicStatusIndicator()}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={exportChatHistory}
              className="p-1 px-2.5 rounded-md border border-slate-800 text-[9px] font-mono text-slate-400 font-bold hover:border-sky-500/40 hover:text-sky-400 transition-all uppercase cursor-pointer"
              title="Export chat history as JSON"
            >
              Export
            </button>
            <button
              onClick={() => setMessages([])}
              className="p-1 px-2.5 rounded-md border border-slate-800 text-[9px] font-mono text-slate-400 font-bold hover:border-rose-500/40 hover:text-rose-400 transition-all uppercase cursor-pointer"
            >
              Wipe Chat Logs
            </button>
          </div>
        </div>

        {/* View Contents */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 no-scrollbar">
          
          {/* TAB 1: Cockpit Intelligent chat center */}
          {activeTab === 'cockpit' && (
            <div className="h-full flex flex-col justify-between">
              
              {/* Dynamic HUD Control toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 select-none">
                
                {/* Multi-Agent Selector dropdown board */}
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/85">
                  <label className="text-[9px] font-bold font-mono tracking-wider text-slate-500 uppercase block mb-1">
                    Multi-Agent Core Layer
                  </label>
                  <select
                    value={agentType}
                    onChange={(e) => {
                      setAgentType(e.target.value as any);
                      speakNarrative(`Coupling standard neural parameters into ${e.target.value} agent structures.`);
                      pushLog(`Activated Multi-Agent Module: ${e.target.value}`);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-[11px] h-7 px-1.5 outline-none cursor-pointer focus:border-sky-500"
                  >
                    <option value="general">JARVIS OS CORE</option>
                    <option value="teacher">TEACHER AI (Dr. Banner - PCM Solver)</option>
                    <option value="coder">CODING AI (Developer Suite Pro)</option>
                    <option value="planner">PLANNER AI (Smart Timetabler)</option>
                    <option value="research">RESEARCH AI (Deep Web Grounding)</option>
                    <option value="motivator">MOTIVATOR AI (Suit Assist Voice)</option>
                  </select>
                </div>

                {/* 4. Real-time internet search Grounding trigger */}
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/85 flex items-center justify-between">
                  <div>
                    <label className="text-[9px] font-bold font-mono tracking-wider text-slate-500 uppercase block leading-none mb-1">
                      Google Search Grounding
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">Real-time internet web results</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableInternetSearch}
                    onChange={(e) => {
                      setEnableInternetSearch(e.target.checked);
                      pushLog(`Google Search Grounded: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                      speakNarrative(`Real time internet search grounding parameter modified, Sir.`);
                    }}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* 12. Local AI support with Ollama */}
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/85 sm:col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-bold font-mono tracking-wider text-slate-500 uppercase block">
                      Local AI (Ollama Support)
                    </label>
                    <input
                      type="checkbox"
                      checked={enableOllama}
                      onChange={(e) => {
                        setEnableOllama(e.target.checked);
                        pushLog(`Ollama local integration: ${e.target.checked ? 'LIVE' : 'DISABLED'}`);
                      }}
                      className="w-3.5 h-3.5 accent-violet-500 cursor-pointer"
                    />
                  </div>
                  {enableOllama ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        placeholder="Port URL"
                        className="flex-1 bg-slate-900 border border-slate-800 text-[9px] rounded px-1 text-white font-mono"
                      />
                      <input
                        type="text"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="Model"
                        className="w-16 bg-slate-900 border border-slate-800 text-[9px] rounded px-1 text-white font-mono"
                      />
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">Inactive. Integrates local laptops Ollama port.</span>
                  )}
                </div>

              </div>

              {/* Chat timeline messages list */}
              <div className="flex-1 min-h-[350px] overflow-y-auto space-y-4 pr-1 mb-4 select-text">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3.5 pt-12 select-none">
                    <div className="relative group flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-xl animate-pulse group-hover:scale-135 transition-all duration-500" />
                      <div className="w-16 h-16 rounded-full border border-sky-500/30 flex items-center justify-center bg-slate-950/70 text-sky-400 relative">
                        <Sparkles className="w-7 h-7 text-sky-450 animate-bounce" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                        AWAITING INSTRUCTIONS PRINCE
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 uppercase font-mono">
                        "Your command is my core directive." Select PCM solvers from the menus, upload screenshots for active Camera Vision scanner, or activate mic word wakener "Hey Jarvis" to automate routines.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isAssistant = m.role === 'assistant';
                    return (
                      <div
                        key={m.id || idx}
                        className={`flex gap-3 max-w-[88%] ${
                          isAssistant ? 'self-start text-left' : 'self-end flex-row-reverse text-right ml-auto'
                        }`}
                      >
                        <div className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center flex-shrink-0 text-xs select-none ${
                          isAssistant 
                            ? 'bg-slate-950 border-slate-800 text-sky-400' 
                            : 'bg-sky-500 border-sky-400 text-slate-950 font-extrabold'
                        }`}>
                          {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="space-y-1.5">
                          <div className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-lg border relative ${
                            isAssistant 
                              ? 'bg-slate-950/60 border-slate-850 text-slate-200' 
                              : 'bg-sky-500 text-slate-950 font-medium border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                          }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            
                            {/* Option to vocalize bot text */}
                            {isAssistant && (
                              <button
                                onClick={() => speakNarrative(m.content)}
                                className="mt-2.5 text-[9px] font-mono text-slate-500 hover:text-sky-400 flex items-center gap-1 uppercase font-bold tracking-widest float-right transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Vocalize Response
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Cognitive thinking status layout */}
                {isThinking && (
                  <div className="flex gap-3 max-w-[70%] select-none">
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-xs">
                      <Bot className="w-3.5 h-3.5 text-sky-450 animate-bounce" />
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping" />
                      Defragmenting cognitive relays...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputVal.trim() || attachedImage) {
                    sendMessage(inputVal);
                  }
                }}
                className="p-3 border border-slate-850/80 rounded-2xl bg-slate-950/40 space-y-2"
              >
                
                {/* Displaying selected OCR scan image */}
                {attachedImage && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-sky-500/25 bg-sky-950/15">
                    <div className="flex items-center gap-2 text-xs truncate">
                      <Paperclip className="w-4 h-4 text-sky-400 flex-shrink-0 animate-bounce" />
                      <span className="text-white font-mono truncate max-w-xs">{attachedImage.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono">(Camera Vision scan queued)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 font-bold px-2 py-0.5 cursor-pointer border border-rose-500/20 rounded-md bg-rose-500/5 hover:bg-rose-500/10"
                    >
                      Discharge File
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-200">
                  
                  {/* Camera Vision attachment icon trigger */}
                  <div className="relative cursor-pointer select-none">
                    <label
                      htmlFor="vision-upload-camera-btn"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      title="Coupling Camera Vision OCR scanning file models"
                    >
                      <Layers className="w-4 h-4 text-sky-400" />
                    </label>
                    <input
                      id="vision-upload-camera-btn"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadChange}
                      className="absolute inset-0 w-0 h-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask command or say 'Hey Jarvis'..."
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 font-sans outline-none"
                    disabled={isThinking}
                  />

                  <button
                    type="button"
                    onClick={handleMicTrigger}
                    className={`p-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-500/15 border border-rose-500/35 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300'
                    }`}
                    title={isListening ? "Mute Microphone" : "Activate Voice Command"}
                  >
                    {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    disabled={(!inputVal.trim() && !attachedImage) || isThinking}
                    className="p-2.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:scale-100 bg-gradient-to-r from-sky-500 to-sky-450 hover:to-sky-400 text-slate-950 font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1 font-mono text-xs uppercase"
                    title="Transmit command stream"
                  >
                    Send <Send className="w-3.5 h-3.5 flex-shrink-0 text-slate-900" />
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: AI Study Coach & Quiz Solver */}
          {activeTab === 'study' && (
            <div className="space-y-6">
              
              {/* Introduction headers */}
              <div className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800/80 relative overflow-hidden select-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl font-black" />
                <h2 className="text-sm font-black tracking-widest text-sky-400 uppercase font-mono">
                  🔬 ACADEMIC PHYSICS, CHEMISTRY & MATH SOLVERS
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 uppercase font-mono leading-relaxed">
                  Couples custom analytical prompt frameworks into the core model parameters for step-by-step scientific study breakthroughs, deriving formulas from scratch.
                </p>
              </div>

              {/* Study Coach Solvers panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs select-none">
                
                {/* Physics solver macro */}
                <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-850 border-t-2 border-t-sky-500/60 leading-relaxed text-slate-350 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-xs">🚀 PHYSICS COGNITIVE SOLVER</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Solves Mechanics forces, electromagnetic fields, kinematics, quantum optics.</p>
                  </div>
                  <div className="space-y-1.5 pt-3">
                    <button
                      onClick={() => runStudySolverTemplate('Physics', 'Calculate the angular velocity and centripetal tension of a mass of 5kg rotating round a 1.2m radius chord at 15 m/s.')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Kepler laws centripetal force
                    </button>
                    <button
                      onClick={() => runStudySolverTemplate('Physics', 'Derive Schrodinger wave equations for particles trapped within a one dimensional infinite potential well.')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Infinite potential quantum well
                    </button>
                  </div>
                </div>

                {/* Chemistry solver macro */}
                <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-850 border-t-2 border-t-[#ec4899]/60 leading-relaxed text-slate-350 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-xs">🧪 CHEMISTRY FORMULAS SOLVER</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Balances oxidation-reduction reactions, calculates stoichiometry kinetics.</p>
                  </div>
                  <div className="space-y-1.5 pt-3">
                    <button
                      onClick={() => runStudySolverTemplate('Chemistry', 'Balance this acidic redox reaction step by step: Cr2O7(2-) + Fe(2+) -> Cr(3+) + Fe(3+).')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Redox acidic structural balancing
                    </button>
                    <button
                      onClick={() => runStudySolverTemplate('Chemistry', 'Determine orbital state parameters and steric hybridization numbers of Nitrogen in Nitrate ion (NO3-).')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Nitrate ion steric VSEPR model
                    </button>
                  </div>
                </div>

                {/* Math solver macro */}
                <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-850 border-t-2 border-t-[#a78bfa]/60 leading-relaxed text-slate-350 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-xs">📐 INTEGRAL MATHEMATICAL MATHEMATICS</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Evaluates integrals, solves systems, matrix determinants, proofs.</p>
                  </div>
                  <div className="space-y-1.5 pt-3">
                    <button
                      onClick={() => runStudySolverTemplate('Math', 'Prove lim (x -> 0) [1 - cos(x)] / [x^2] is equivalent to 1/2 without utilizing LHospitals rule directly.')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Limits trig proof squeeze law
                    </button>
                    <button
                      onClick={() => runStudySolverTemplate('Math', 'Integrate step-by-step using parts methods: Integral[ x^2 * ln(x) dx ].')}
                      className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white truncate"
                    >
                      → Integration by parts algorithm
                    </button>
                  </div>
                </div>

              </div>

              {/* MCQ Quiz game module board */}
              <div className="bg-[#050917] p-5 rounded-3xl border border-slate-800/80 relative">
                <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3 select-none">
                  <div>
                    <h3 className="text-xs font-black text-sky-400 font-mono tracking-wider">
                      📝 ACADEMIC QUIZ GENERATOR & FEEDBACK ENGINE
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Gain +50 Focus XP per correct question parameter.</p>
                  </div>
                  {!quizActive && (
                    <button
                      onClick={generateInteractiveQuiz}
                      className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black font-mono uppercase tracking-wider rounded-xl cursor-pointer active:scale-95"
                    >
                      Ignite Quiz Session
                    </button>
                  )}
                </div>

                {quizActive ? (
                  <div className="space-y-4 font-sans">
                    
                    {/* Active Question Title info */}
                    <div className="flex justify-between text-xs font-mono select-none">
                      <span className="text-sky-400 font-bold uppercase tracking-widest">
                        Evaluating Phase: {currentQuizIdx + 1} / {quizQuestions.length}
                      </span>
                      <span className="text-slate-400 uppercase font-bold">
                        Score Accumulation: {quizScore} / {currentQuizIdx + 1}
                      </span>
                    </div>

                    <h4 className="text-sm text-white font-extrabold max-w-2xl leading-relaxed">
                      {quizQuestions[currentQuizIdx].question}
                    </h4>

                    {/* Choices buttons layout */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {quizQuestions[currentQuizIdx].options.map((option, oidx) => (
                        <button
                          key={oidx}
                          disabled={quizFeedback !== null}
                          onClick={() => submitQuizChoice(oidx)}
                          className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all font-sans cursor-pointer ${
                            quizFeedback 
                              ? oidx === quizQuestions[currentQuizIdx].answerIndex
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold'
                                : 'bg-slate-950/40 border-slate-900 text-slate-500'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="font-mono text-sky-400 font-bold mr-2 uppercase">({['A','B','C','D'][oidx]})</span>
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Feedback report results */}
                    {quizFeedback && (
                      <div className="bg-slate-950/90 border border-slate-850 p-4.5 rounded-2xl relative">
                        <p className="text-xs text-slate-100 italic leading-relaxed whitespace-pre-wrap">
                          {quizFeedback}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed uppercase font-mono">
                          🔍 Explanation: {quizQuestions[currentQuizIdx].explanation}
                        </p>
                        <button
                          onClick={advanceQuiz}
                          className="mt-3 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider rounded-xl cursor-pointer"
                        >
                          {currentQuizIdx === quizQuestions.length - 1 ? "Complete Quiz OS" : "Advance Question ->"}
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 font-mono text-xs select-none">
                    Session diagnostic offline. Click "Ignite Quiz Session" to generate customized Science Board test MCQs.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: Smart Scheduler (timetable homework countdown) */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Homework Tracker checklist card */}
                <div className="md:col-span-2 bg-[#040816] border border-slate-800 p-5 rounded-3xl select-none flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                      <h3 className="text-xs font-black text-white font-mono tracking-widest flex items-center gap-1.5 uppercase">
                        <CheckSquare className="w-4 h-4 text-sky-400" /> Active Academic Homework Tracker
                      </h3>
                      <span className="bg-sky-500/10 border border-sky-500/15 text-sky-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                        Persistent DB
                      </span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = e.target as any;
                        addHomework(f.title.value, f.subject.value, f.deadline.value);
                        f.reset();
                      }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850"
                    >
                      <input
                        name="title"
                        type="text"
                        placeholder="Task Title"
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        required
                      />
                      <input
                        name="subject"
                        type="text"
                        placeholder="Subject PCM"
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        required
                      />
                      <div className="flex gap-1.5">
                        <input
                          name="deadline"
                          type="date"
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1.5 text-[10px] text-white outline-none"
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold text-xs rounded uppercase cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    {/* Homework list item rows */}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar font-mono text-[11px]">
                      {homeworks.length === 0 ? (
                        <p className="text-slate-600 italic text-[10px] py-4">No active assignments recorded, sir.</p>
                      ) : (
                        homeworks.map(hw => (
                          <div 
                            key={hw.id}
                            className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-850 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hw.completed}
                                onChange={() => toggleHomeworkCompleted(hw.id)}
                                className="w-3.5 h-3.5 accent-sky-400 cursor-pointer"
                              />
                              <span className={`text-slate-200 ${hw.completed ? 'line-through text-slate-600' : ''}`}>
                                [{hw.subject}] {hw.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 select-none">
                              <span className="text-[9px] text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                📅 Limit: {hw.deadline}
                              </span>
                              <button
                                onClick={() => deleteHomework(hw.id)}
                                className="text-rose-450 hover:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 mt-3 flex justify-between items-center bg-slate-950/10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Secure server serialization active</span>
                    <button
                      onClick={triggerAutoTimetableGenerator}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      🤖 Auto-Generate Timetable Draft
                    </button>
                  </div>
                </div>

                {/* Exam Board countdown widget layout */}
                <div className="bg-[#030612] border border-slate-800 p-5 rounded-3xl select-none flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-850 pb-2">
                      <h3 className="text-xs font-black text-white font-mono tracking-widest uppercase">
                        🗓️ TARGET EXAM COUNTDOWN
                      </h3>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Custom timeline metrics tracker</p>
                    </div>

                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center space-y-1">
                      <span className="text-3xl font-black text-rose-500 font-mono tracking-tighter block">{daysRemaining}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Days Standby to Exam</span>
                    </div>

                    <div className="space-y-2 font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block mb-0.5 uppercase font-bold">Exam Designation:</span>
                        <input
                          type="text"
                          value={examCountdown.title}
                          onChange={(e) => {
                            const updated = { ...examCountdown, title: e.target.value };
                            setExamCountdown(updated);
                            syncToBackendDB({ examDetails: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5 uppercase font-bold">Exam Target Date:</span>
                        <input
                          type="date"
                          value={examCountdown.date}
                          onChange={(e) => {
                            const updated = { ...examCountdown, date: e.target.value };
                            setExamCountdown(updated);
                            syncToBackendDB({ examDetails: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-650 font-mono leading-tight uppercase pt-3 border-t border-slate-850">
                    Calculated accurately utilizing server-configured timelines, sir.
                  </div>
                </div>

              </div>

              {/* Reminders layout list */}
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row gap-5">
                
                {/* Setup form widget */}
                <div className="w-full md:w-80 space-y-3 shrink-0 select-none">
                  <div>
                    <h3 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                      🔔 MICRO REMINDER MATRIX
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono leading-none mt-1">Automatic vocal readout on target</p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = e.target as any;
                      addReminder(f.text.value, f.time.value);
                      f.reset();
                    }}
                    className="space-y-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-850/80 font-mono text-[10px]"
                  >
                    <div>
                      <span className="text-slate-500 uppercase block mb-1 font-bold">Reminder Subject:</span>
                      <input
                        name="text"
                        type="text"
                        placeholder="PCM revision etc."
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block mb-1 font-bold">Trigger Alarm Time (24h):</span>
                      <input
                        name="time"
                        type="time"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase rounded-lg block cursor-pointer transition-colors"
                    >
                      Add Alarm Trigger
                    </button>
                  </form>
                </div>

                {/* Display list row */}
                <div className="flex-1 space-y-2 font-mono text-[11px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-1.5">
                    Target Alarms Standby Logs
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                    {reminders.length === 0 ? (
                      <p className="text-slate-600 italic text-[10px] py-4">No alarms active inside cockpit storage, Sir.</p>
                    ) : (
                      reminders.map(rem => (
                        <div key={rem.id} className="p-2 bg-slate-900/60 border border-slate-850 rounded-xl flex justify-between items-center">
                          <span className="text-slate-200">🔔 {rem.text}</span>
                          <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-500/15">
                            ⏱️ {rem.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: Analytics and Reports Dashboard */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Cumulative study hours stopwatch metrics */}
                <div className="bg-[#030612] border border-slate-800 p-5 rounded-3xl select-none flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-850 pb-2">
                      <h3 className="text-xs font-black text-white font-mono tracking-widest uppercase">
                        ⏱️ FOCUS STATION CHRONOMETER
                      </h3>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Cumulative block hours recorder</p>
                    </div>

                    <div className="p-5 bg-sky-500/5 border border-sky-500/10 rounded-2xl text-center space-y-1">
                      <span className="text-4xl font-extrabold text-sky-400 font-mono tracking-tighter block">
                        {formatStopwatchTime(studySecondsElapsed)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest block">
                        Active Elapsed Revision Timer
                      </span>
                    </div>

                    <button
                      onClick={toggleStudyStopwatch}
                      className={`w-full py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        studySessionActive
                          ? 'bg-rose-500/15 border border-rose-500/35 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {studySessionActive ? '🛑 Terminate Study Chrono' : '▶️ Launch Study Session'}
                    </button>
                  </div>

                  <p className="text-[9.5px] text-slate-500 font-mono mt-4 leading-normal uppercase pt-2 border-t border-slate-850">
                    Warning: session details append cumulative values back to database reports upon completion.
                  </p>
                </div>

                {/* Study reports weekly chart card */}
                <div className="bg-[#030612] border border-slate-800 p-5 rounded-3xl md:col-span-2 select-none">
                  <div className="border-b border-slate-850 pb-2 mb-4">
                    <h3 className="text-xs font-black text-white font-mono tracking-widest uppercase">
                      📊 WEEKLY STUDY BLOCKS INTENSITY INDEX
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Synthesized using core focus indicators</p>
                  </div>

                  {/* Recharts Analytics Visualization */}
                  <div className="h-56 w-full pt-4 border-b border-slate-850 bg-slate-950/20 rounded-2xl relative font-mono text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={weeklyStudyTracker} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontWeight: 'bold' }}
                          itemStyle={{ fontSize: '12px' }}
                          labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                        />
                        <Bar yAxisId="left" dataKey="hours" name="Study Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={24} />
                        <Line yAxisId="right" type="monotone" dataKey="goalCompletion" name="Goal Completion %" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-between font-mono text-[9.5px] text-slate-600 mt-2.5 uppercase leading-none">
                    <span>Performance telemetry synchronized</span>
                    <span>Total Target: PCM, Coding Drills</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: PDF and Document AI */}
          {activeTab === 'docai' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800/80 select-none">
                <h2 className="text-sm font-black tracking-widest text-[#a78bfa] uppercase font-mono">
                  📄 PDF, NOTEPADS AND DOCUMENT ANALYSIS PLATFORM
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 uppercase font-mono leading-relaxed">
                  Sir, paste lecture transcripts, formulas details, or document reference proofs below. Jarvis text intelligence compiles concise summaries, compiles challenging formulas, or generates flashcards interactively in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Input block */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block select-none">
                    📋 Paste reference transcripts content
                  </span>
                  <textarea
                    value={rawDocumentText}
                    onChange={(e) => setRawDocumentText(e.target.value)}
                    placeholder="Paste reference material texts here to evaluate formulas, summary briefings, or flashcard MCQs..."
                    className="w-full h-80 bg-slate-900 border border-slate-850 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 outline-none focus:border-[#a78bfa] font-sans resize-none"
                  />
                  <div className="grid grid-cols-3 gap-2 select-none">
                    <button
                      onClick={() => executePDFNoteSummary('summarize')}
                      disabled={docSummaryLoading}
                      className="py-2.5 text-[9px] bg-sky-500/10 border border-sky-500/20 text-sky-400 font-extrabold uppercase font-mono tracking-wider rounded-xl cursor-pointer hover:bg-sky-500/15"
                    >
                      Summarize Text
                    </button>
                    <button
                      onClick={() => executePDFNoteSummary('formulas')}
                      disabled={docSummaryLoading}
                      className="py-2.5 text-[9px] bg-violet-500/10 border border-violet-500/20 text-[#a78bfa] font-extrabold uppercase font-mono tracking-wider rounded-xl cursor-pointer hover:bg-violet-500/15"
                    >
                      Extract Formulas
                    </button>
                    <button
                      onClick={() => executePDFNoteSummary('mcqs')}
                      disabled={docSummaryLoading}
                      className="py-2.5 text-[9px] bg-[#ec4899]/10 border border-[#ec4899]/20 text-[#ec4899] font-extrabold uppercase font-mono tracking-wider rounded-xl cursor-pointer hover:bg-[#ec4899]/15"
                    >
                      Create Study MCQs
                    </button>
                  </div>
                </div>

                {/* Output block rendering */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block select-none">
                    🎯 AI Synthesized Study Output Logs
                  </span>
                  <div className="w-full h-[375px] bg-slate-950/60 border border-slate-850 rounded-2xl p-4 text-xs overflow-y-auto leading-relaxed select-text font-serif">
                    {docSummaryLoading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-2 select-none">
                        <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-ping" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Performing deep analysis scans...</span>
                      </div>
                    ) : docSummaryOutput ? (
                      <p className="whitespace-pre-wrap text-slate-200 font-sans">{docSummaryOutput}</p>
                    ) : (
                      <span className="text-slate-650 italic font-mono text-[10px] block select-none">No synthesized study logs populated. Fire summary/formula actions to generate reference brief, Sir.</span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
