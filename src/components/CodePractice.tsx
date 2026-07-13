import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Terminal, Play, CheckCircle, Lock, Star, Trophy, Target, Award, Clock, ArrowLeft, ChevronRight, X, Maximize2, Search, Filter, BookOpen, Flame, Activity, Zap } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

interface CodePracticeProps {
  onAwardXP: (amount: number) => void;
}

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: Terminal, color: 'from-blue-500 to-yellow-500', grammar: Prism.languages.python },
  { id: 'javascript', name: 'JavaScript', icon: Code, color: 'from-yellow-400 to-orange-500', grammar: Prism.languages.javascript },
  { id: 'java', name: 'Java', icon: Terminal, color: 'from-red-500 to-blue-500', grammar: Prism.languages.java },
  { id: 'cpp', name: 'C++', icon: Code, color: 'from-blue-600 to-blue-400', grammar: Prism.languages.cpp },
  { id: 'c', name: 'C', icon: Code, color: 'from-blue-500 to-blue-300', grammar: Prism.languages.c },
  { id: 'html', name: 'HTML', icon: Code, color: 'from-orange-500 to-red-500', grammar: Prism.languages.markup },
  { id: 'css', name: 'CSS', icon: Code, color: 'from-blue-400 to-blue-300', grammar: Prism.languages.css },
  { id: 'sql', name: 'SQL', icon: Terminal, color: 'from-blue-400 to-cyan-400', grammar: Prism.languages.clike },
  { id: 'php', name: 'PHP', icon: Code, color: 'from-indigo-400 to-purple-500', grammar: Prism.languages.clike },
  { id: 'kotlin', name: 'Kotlin', icon: Code, color: 'from-purple-500 to-orange-500', grammar: Prism.languages.clike },
  { id: 'dart', name: 'Dart', icon: Code, color: 'from-cyan-500 to-blue-500', grammar: Prism.languages.clike },
  { id: 'csharp', name: 'C#', icon: Code, color: 'from-green-500 to-emerald-500', grammar: Prism.languages.clike },
  { id: 'go', name: 'Go', icon: Code, color: 'from-cyan-400 to-blue-400', grammar: Prism.languages.clike },
  { id: 'rust', name: 'Rust', icon: Code, color: 'from-orange-600 to-red-600', grammar: Prism.languages.clike }
];

const TOPICS = [
  'Introduction', 'Syntax', 'Variables', 'Data Types', 'Operators',
  'Input Output', 'Conditions', 'Loops', 'Functions', 'Arrays',
  'Strings', 'Pointers (C/C++)', 'Classes & Objects', 'File Handling',
  'Exception Handling', 'Practice Questions'
];

const PROBLEMS = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', language: 'python', xp: 50,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    sampleInput: 'nums = [2,7,11,15], target = 9', sampleOutput: '[0,1]',
    hint: 'Use a hash map to store the elements and their indices.',
    solution: 'def twoSum(nums, target):\n    d = {}\n    for i, n in enumerate(nums):\n        if target - n in d:\n            return [d[target - n], i]\n        d[n] = i'
  },
  {
    id: 2, title: 'Reverse String', difficulty: 'Easy', topic: 'Strings', language: 'javascript', xp: 30,
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    sampleInput: 's = ["h","e","l","l","o"]', sampleOutput: '["o","l","l","e","h"]',
    hint: 'Use two pointers approach.',
    solution: 'function reverseString(s) {\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        let temp = s[left];\n        s[left++] = s[right];\n        s[right--] = temp;\n    }\n}'
  },
  {
    id: 3, title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', language: 'cpp', xp: 100,
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
    sampleInput: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', sampleOutput: '[[1,6],[8,10],[15,18]]',
    hint: 'Sort the intervals by their start times.',
    solution: 'vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> res;\n    for (auto interval : intervals) {\n        if (res.empty() || res.back()[1] < interval[0]) {\n            res.push_back(interval);\n        } else {\n            res.back()[1] = max(res.back()[1], interval[1]);\n        }\n    }\n    return res;\n}'
  }
];

export default function CodePractice({ onAwardXP }: CodePracticeProps) {
  const [view, setView] = useState<'dashboard' | 'language_select' | 'learning' | 'practice_list' | 'editor'>('dashboard');
  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard Stats
  const stats = {
    solved: 12, totalXP: 1450, level: 5, streak: 7, rank: 'Silver',
    weekly: 85, monthly: 60, favLang: 'Python', studyTime: '24h', accuracy: '92%'
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setOutput('');
    setTimeout(() => {
      setIsCompiling(false);
      // Simulate compiler output
      if (code.includes('error') || code.trim() === '') {
        setOutput('SyntaxError: unexpected EOF while parsing\n    at line 1');
      } else {
        setOutput('Execution Successful.\nOutput: ' + selectedProblem?.sampleOutput);
        onAwardXP(selectedProblem?.xp || 10);
      }
    }, 1500);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Problems Solved', value: stats.solved, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Coding XP', value: stats.totalXP, icon: Star, color: 'text-yellow-500' },
          { label: 'Daily Streak', value: stats.streak, icon: Flame, color: 'text-orange-500' },
          { label: 'Current Level', value: stats.level, icon: Trophy, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/10 dark:bg-black/20 p-4 rounded-2xl border border-white/20 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <stat.icon className={`w-8 h-8 mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs opacity-70">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-white/10 dark:bg-black/20 p-6 rounded-3xl border border-white/20 dark:border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" /> Daily Challenges
        </h3>
        <div className="space-y-3">
          {PROBLEMS.slice(0, 3).map((prob, i) => (
            <div key={i} onClick={() => { setSelectedProblem(prob); setSelectedLang(LANGUAGES.find(l => l.id === prob.language)); setCode(''); setOutput(''); setView('editor'); }} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <div>
                <div className="font-semibold">{prob.title}</div>
                <div className="text-xs opacity-70">{prob.difficulty} • {prob.xp} XP</div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setView('language_select')} className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all">
        <Code className="w-5 h-5" /> Start Coding Practice
      </button>
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 bg-black/5 dark:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold">Select Language</h2>
      </div>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
        <input 
          type="text" 
          placeholder="Search languages..." 
          className="w-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {LANGUAGES.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((lang) => (
          <button 
            key={lang.id} 
            onClick={() => { setSelectedLang(lang); setView('learning'); setSearchQuery(''); }}
            className="p-4 rounded-2xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 flex flex-col items-center gap-3 hover:scale-105 transition-all"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${lang.color} text-white`}><lang.icon className="w-6 h-6" /></div>
            <span className="font-semibold">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('language_select')} className="p-2 bg-black/5 dark:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold flex items-center gap-2"><selectedLang.icon className="w-6 h-6" /> {selectedLang.name} Path</h2>
        </div>
        <button onClick={() => setView('practice_list')} className="px-4 py-2 bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-600/30">
          Go to Problems
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOPICS.map((topic, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/10 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10 cursor-pointer hover:bg-white/20 dark:hover:bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-sm font-bold">{i + 1}</div>
              <span className="font-medium">{topic}</span>
            </div>
            <Lock className="w-4 h-4 opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPracticeList = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('learning')} className="p-2 bg-black/5 dark:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold">{selectedLang.name} Problems</h2>
      </div>
      <div className="space-y-3">
        {PROBLEMS.map((prob) => (
          <div key={prob.id} onClick={() => { setSelectedProblem(prob); setCode(''); setOutput(''); setView('editor'); setShowHint(false); setShowSolution(false); }} className="flex items-center justify-between p-5 bg-white/10 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10 cursor-pointer hover:scale-[1.01] transition-transform">
            <div>
              <div className="font-bold text-lg mb-1">{prob.title}</div>
              <div className="flex items-center gap-3 text-xs opacity-70">
                <span className={`px-2 py-1 rounded bg-black/10 dark:bg-white/10 ${prob.difficulty === 'Easy' ? 'text-emerald-500' : prob.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>{prob.difficulty}</span>
                <span>{prob.topic}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500"><Star className="w-4 h-4" /> {prob.xp}</div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('practice_list')} className="p-2 bg-black/5 dark:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-xl font-bold">{selectedProblem.title}</h2>
            <div className="text-xs opacity-70">{selectedLang.name} • {selectedProblem.difficulty}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCode(''); setOutput(''); }} className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl font-semibold hover:bg-black/10 dark:hover:bg-white/10">Clear</button>
          <button onClick={handleRunCode} disabled={isCompiling} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
            {isCompiling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" fill="currentColor" />}
            Run Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
        {/* Problem Description */}
        <div className="bg-white/10 dark:bg-black/20 p-6 rounded-3xl border border-white/20 dark:border-white/10 overflow-y-auto space-y-6 flex flex-col">
          <div>
            <h3 className="font-bold mb-2">Description</h3>
            <p className="opacity-80 text-sm leading-relaxed">{selectedProblem.description}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-sm">Sample Input</h3>
            <div className="bg-black/10 dark:bg-white/5 p-3 rounded-xl font-mono text-xs opacity-80">{selectedProblem.sampleInput}</div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-sm">Sample Output</h3>
            <div className="bg-black/10 dark:bg-white/5 p-3 rounded-xl font-mono text-xs opacity-80">{selectedProblem.sampleOutput}</div>
          </div>
          
          <div className="flex gap-2 mt-auto">
            <button onClick={() => setShowHint(!showHint)} className="flex-1 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-sm hover:bg-indigo-500/20">
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button onClick={() => setShowSolution(!showSolution)} className="flex-1 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl font-semibold text-sm hover:bg-orange-500/20">
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>
          
          <AnimatePresence>
            {showHint && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-indigo-500/10 p-4 rounded-xl text-sm text-indigo-600 dark:text-indigo-300">
                <strong>Hint:</strong> {selectedProblem.hint}
              </motion.div>
            )}
            {showSolution && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-orange-500/10 p-4 rounded-xl text-sm text-orange-600 dark:text-orange-300 font-mono whitespace-pre-wrap overflow-x-auto">
                {selectedProblem.solution}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor & Output */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-[#1e1e1e] rounded-3xl overflow-hidden border border-white/10 relative group">
            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => navigator.clipboard.writeText(code)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"><Code className="w-4 h-4" /></button>
            </div>
            <div className="h-full overflow-y-auto" style={{ minHeight: '300px' }}>
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => Prism.highlight(code, selectedLang.grammar || Prism.languages.javascript, selectedLang.id)}
                padding={24}
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 14,
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  minHeight: '100%',
                }}
                textareaClassName="outline-none"
              />
            </div>
          </div>
          
          {/* Console */}
          <div className="h-48 bg-[#0a0a0a] rounded-3xl border border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-white/50 flex items-center gap-2"><Terminal className="w-4 h-4" /> Output Console</div>
            </div>
            <div className={`flex-1 font-mono text-sm overflow-y-auto whitespace-pre-wrap ${output.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {output || <span className="opacity-30">Run code to see output...</span>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Jarvis AI Assistant for Coding */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 rounded-3xl border border-indigo-500/30 flex items-center justify-between cursor-pointer hover:from-indigo-600/30 hover:to-purple-600/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Zap className="w-5 h-5" /></div>
          <div>
            <div className="font-bold">Ask Jarvis (AI Assistant)</div>
            <div className="text-xs opacity-70">Explain code, fix bugs, optimize algorithms</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 sm:p-6 pb-32 max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center gap-3">
          <Code className="w-8 h-8 text-indigo-500" /> Code Practice
        </h1>
        <p className="text-black/50 dark:text-white/50 mt-2">Master programming with interactive challenges and AI guidance.</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'dashboard' && renderDashboard()}
          {view === 'language_select' && renderLanguages()}
          {view === 'learning' && renderLearning()}
          {view === 'practice_list' && renderPracticeList()}
          {view === 'editor' && renderEditor()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
