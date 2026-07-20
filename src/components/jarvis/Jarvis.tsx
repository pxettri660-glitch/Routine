import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, Plus, Menu, X,
  Trash2, FileText, Check, Paperclip, Search, Download, Clock,
  Settings, ChevronDown, Monitor, Image as ImageIcon,
  Mic, Globe, Code, History, Cpu, FileUp, Zap, RefreshCw,
  MoreHorizontal, ThumbsUp, ThumbsDown, Copy
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { useFirestoreCollection } from '../../hooks/useFirestoreSync';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
}

interface JarvisProps {
  onNavigate?: (viewId: string) => void;
  selectedTheme?: 'cyan' | 'red' | 'purple' | 'gold';
  onChangeTheme?: (theme: 'cyan' | 'red' | 'purple' | 'gold') => void;
  isThemeLight?: boolean;
  onToggleLightDarkTheme?: () => void;
}

export default function Jarvis({ 
  selectedTheme = 'cyan', 
  onChangeTheme,
  isThemeLight = false,
  onToggleLightDarkTheme,
  onNavigate
}: JarvisProps) {
  const [messages, setMessages] = useFirestoreCollection<ChatMessage>('chat_messages', []);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiMode, setAiMode] = useState<'general' | 'study' | 'coding' | 'automation'>('general');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; mimeType: string; data: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-u`,
      role: 'user',
      content: query || '[File Attached]',
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);

    try {
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
          agentType: aiMode,
          enableSearch: false,
          image: attachedImage,
          model: selectedModel
        }),
      });

      const rdata = await res.json();
      if (rdata.error) throw new Error(rdata.error);

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}-a`,
        role: 'assistant',
        content: rdata.text,
        modelUsed: rdata.model || 'Unknown Model'
      };

      setMessages((prev: ChatMessage[]) => [...prev, botMsg]);
      setAttachedImage(null);

    } catch (err: any) {
      console.error(err);
      const errBotMsg: ChatMessage = {
        id: `m-${Date.now()}-err`,
        role: 'assistant',
        content: `Error: Could not connect to AI services. ${err.message}`
      };
      setMessages((prev: ChatMessage[]) => [...prev, errBotMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const exportChat = () => {
    try {
      const textContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study_assistant_export_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(prev => prev ? prev + ' ' + transcript : transcript);
      };
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  const themeColors = {
    cyan: 'from-cyan-400 to-blue-500',
    red: 'from-rose-400 to-red-500',
    purple: 'from-violet-400 to-fuchsia-500',
    gold: 'from-amber-300 to-orange-500'
  };

  const activeGradient = themeColors[selectedTheme] || themeColors.cyan;
  const isDark = !isThemeLight;

  return (
    <div className={`h-screen h-[100dvh] w-full flex font-sans overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#000000] text-slate-200' : 'bg-[#fafafa] text-slate-800'}`}>
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[120px] opacity-20 bg-gradient-to-br ${activeGradient}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[120px] opacity-20 bg-gradient-to-tr ${activeGradient}`} />
        <div className={`absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full mix-blend-screen filter blur-[100px] opacity-10 bg-gradient-to-bl ${activeGradient}`} />
        {isDark && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>}
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-md"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Modern Glassmorphism Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        w-[280px] flex flex-col shrink-0 shadow-2xl md:shadow-none backdrop-blur-xl border-r
        ${isDark ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/60 border-black/[0.05]'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white shadow-lg`}>
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="font-semibold tracking-wide text-sm">NEXUS OS</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className={`md:hidden p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => { setMessages([]); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm border shadow-sm group
              ${isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' 
                : 'bg-black text-white hover:bg-gray-800 border-transparent'}
            `}
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            New Session
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
           <button onClick={() => setAiMode('general')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'general' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Globe className="w-4 h-4" /> General AI
           </button>
           <button onClick={() => setAiMode('automation')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'automation' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Zap className="w-4 h-4 text-amber-400" /> ADB Automation
           </button>
           <button onClick={() => setAiMode('study')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'study' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Sparkles className="w-4 h-4" /> Deep Analytics
           </button>
           <button onClick={() => setAiMode('coding')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'coding' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Code className="w-4 h-4" /> Code Sandbox
           </button>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
          <button onClick={exportChat} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}>
             <Download className="w-4 h-4" /> Export Log
          </button>
          <button onClick={() => {}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}>
             <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10 h-screen h-[100dvh]">
        
        {/* Top Header Glassmorphism */}
        <div className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-xl sticky top-0 z-20 border-b transition-colors
          ${isDark ? 'bg-black/40 border-white/[0.05]' : 'bg-white/60 border-black/[0.05]'}
        `}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Elegant Model Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-medium text-sm border shadow-sm group
                  ${isDark 
                    ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10' 
                    : 'bg-white hover:bg-slate-50 border-black/10'
                  }
                `}
              >
                {selectedModel === 'auto' && <><Sparkles className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-500'}`} /> Auto-Select</>}
                {selectedModel === 'gemini' && <><Zap className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} /> Gemini 2.5</>}
                {selectedModel === 'deepseek' && <><Code className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} /> DeepSeek</>}
                {selectedModel === 'llama' && <><Cpu className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} /> Llama 3.3</>}
                <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    className={`absolute top-full left-0 mt-2 w-64 border rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-2xl
                      ${isDark ? 'bg-[#18181b]/90 border-white/10' : 'bg-white/90 border-black/10'}
                    `}
                  >
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest opacity-50">Select Intelligence</div>
                    {[
                      { id: 'auto', label: 'Auto-Select', desc: 'Dynamically routed to best model', icon: Sparkles, color: isDark ? 'text-sky-400' : 'text-sky-500' },
                      { id: 'gemini', label: 'Gemini 2.5 Flash', desc: 'Fastest reasoning & analysis', icon: Zap, color: isDark ? 'text-blue-400' : 'text-blue-500' },
                      { id: 'deepseek', label: 'DeepSeek Chat', desc: 'Superior programming logic', icon: Code, color: isDark ? 'text-emerald-400' : 'text-emerald-500' },
                      { id: 'llama', label: 'Llama 3.3 70B', desc: 'Deep contextual understanding', icon: Cpu, color: isDark ? 'text-violet-400' : 'text-violet-500' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 transition-colors text-left
                          ${selectedModel === m.id 
                            ? isDark ? 'bg-white/10' : 'bg-black/5'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                          }
                        `}
                      >
                        <m.icon className={`w-5 h-5 mt-0.5 ${m.color}`} />
                        <div>
                          <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{m.label}</div>
                          <div className={`text-[11px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>{m.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border shadow-sm cursor-pointer
              ${isDark ? 'bg-white/[0.05] border-white/10 hover:bg-white/10' : 'bg-white border-black/10 hover:bg-slate-50'}
            `}>
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 pb-32 max-w-2xl mx-auto space-y-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 0.6, type: "spring" }}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl relative ${activeGradient}`}
              >
                <div className="absolute inset-0 rounded-3xl bg-white opacity-20 mix-blend-overlay"></div>
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md z-10" />
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.5 }} 
                className="space-y-4"
              >
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">NEXUS Core Online</h2>
                <p className={`text-base ${isDark ? 'text-white/50' : 'text-black/50'}`}>Engage with autonomous intelligence powered by Gemini, DeepSeek, and Llama.</p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.4, duration: 0.5 }} 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
              >
                {[
                  { label: "Automate Android Device (ADB)", icon: Zap, mode: 'automation' },
                  { label: "Run Coding Sandbox", icon: Code, mode: 'coding' },
                  { label: "Deep Data Analytics", icon: Sparkles, mode: 'study' },
                  { label: "General Cognition", icon: Globe, mode: 'general' }
                ].map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setAiMode(s.mode as any); setInputVal(s.label); }} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group
                      ${isDark 
                        ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] hover:border-white/20' 
                        : 'bg-white border-black/5 hover:border-black/15 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-white/[0.05] group-hover:bg-white/10' : 'bg-black/[0.03] group-hover:bg-black/[0.08]'}`}>
                      <s.icon className={`w-5 h-5 ${isDark ? 'text-white/70' : 'text-black/70'}`} />
                    </div>
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full pt-8 pb-48 space-y-10 px-4 sm:px-6">
              {messages.map((m, idx) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    key={m.id || idx} className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[100%] sm:max-w-[88%] flex gap-4 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
                      
                      {isAssistant && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md bg-gradient-to-br ${activeGradient}`}>
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`flex flex-col min-w-0 ${isAssistant ? 'items-start' : 'items-end'}`}>
                        {isAssistant && (
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <span className="text-sm font-semibold tracking-wide">Assistant</span>
                            {m.modelUsed && (
                              <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md border
                                ${isDark ? 'bg-white/10 border-white/10 text-white/70' : 'bg-black/5 border-black/10 text-black/70'}
                              `}>
                                {m.modelUsed}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group
                          ${isAssistant 
                            ? isDark 
                              ? 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-tl-sm' 
                              : 'bg-white border border-black/[0.08] text-slate-800 rounded-tl-sm'
                            : isDark
                              ? 'bg-white/[0.15] text-white rounded-tr-sm'
                              : 'bg-black text-white rounded-tr-sm'
                          }`}
                        >
                          {isAssistant ? (
                            <div className="flex flex-col">
                              <div className={`markdown-body prose prose-sm sm:prose-base max-w-none break-words
                                ${isDark ? 'prose-invert prose-pre:bg-black/50 prose-pre:border-white/10 prose-code:text-sky-300' : 'prose-pre:bg-slate-50 prose-pre:border-slate-200 prose-code:text-sky-600'}
                              `}>
                                <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-4 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                ${isDark ? 'border-white/10' : 'border-black/10'}
                              `}>
                                <button onClick={() => navigator.clipboard.writeText(m.content)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}>
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}>
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}>
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}>
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isThinking && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start">
                  <div className="flex gap-4 flex-row items-end">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br ${activeGradient}`}>
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className={`px-5 py-4 rounded-2xl rounded-tl-sm flex items-center h-[52px]
                      ${isDark ? 'bg-white/[0.05] border border-white/[0.08]' : 'bg-white border border-black/[0.08]'}
                    `}>
                      <div className="flex space-x-1.5 items-center justify-center">
                        <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDark ? 'bg-white/50' : 'bg-black/50'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDark ? 'bg-white/50' : 'bg-black/50'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white/50' : 'bg-black/50'}`}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)] to-transparent pt-12 pb-6 px-4 sm:px-6 z-20 pointer-events-none"
             style={{ '--bg-color': isDark ? '#000000' : '#fafafa' } as React.CSSProperties}>
          
          <div className="max-w-3xl mx-auto relative flex flex-col items-center pointer-events-auto">
            
            <div className="w-full relative group">
              {attachedImage && (
                <div className="absolute -top-16 left-0 right-0 flex justify-center px-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`border rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl max-w-full backdrop-blur-xl
                      ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-black/10'}
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center overflow-hidden">
                      {attachedImage.data ? <img src={attachedImage.data} alt="Upload" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-sky-500" />}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">{attachedImage.name}</span>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className={`p-1.5 rounded-full transition-colors ml-2 ${isDark ? 'hover:bg-white/20 text-white/70' : 'hover:bg-black/10 text-black/70'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              )}

              <form 
                onSubmit={(e) => { e.preventDefault(); if (inputVal.trim() || attachedImage) sendMessage(inputVal); }}
                className={`relative backdrop-blur-2xl border transition-all duration-300 rounded-3xl shadow-lg flex items-end p-2 
                  ${isDark 
                    ? 'bg-white/[0.08] border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:bg-white/[0.12]' 
                    : 'bg-white/90 border-black/10 hover:border-black/20 focus-within:border-black/30 focus-within:shadow-xl'
                  }
                `}
              >
                <div className="relative mb-1 ml-1 flex">
                  <label 
                    htmlFor="file-upload" 
                    className={`p-3 cursor-pointer rounded-full transition-colors flex items-center justify-center
                      ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'}
                    `}
                    title="Attach file"
                  >
                    <Plus className="w-5 h-5" />
                  </label>
                  <input id="file-upload" type="file" accept="image/*,.pdf,.txt" onChange={handleImageUploadChange} className="hidden" />
                </div>

                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputVal.trim() || attachedImage) sendMessage(inputVal);
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 max-h-[200px] min-h-[48px] bg-transparent px-3 py-3.5 outline-none resize-none overflow-y-auto leading-relaxed text-[16px] placeholder-opacity-50"
                  rows={1}
                  style={{ height: 'auto' }}
                  disabled={isThinking}
                />

                <div className="flex items-center gap-1 mb-1 mr-1">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-full transition-colors hidden sm:flex items-center justify-center
                      ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'}
                    `}
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={(!inputVal.trim() && !attachedImage) || isThinking}
                    className={`p-3 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm
                      ${inputVal.trim() || attachedImage 
                        ? (isDark ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105')
                        : (isDark ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-black/5 text-black/30 cursor-not-allowed')
                      }
                    `}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-3 text-xs font-medium opacity-50">
                NEXUS AI executes automated tasks and reasoning. Verify physical actions when prompted.
              </div>
            
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
