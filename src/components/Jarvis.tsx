import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, Plus, Menu, X,
  Trash2, FileText, Check, Paperclip, CheckSquare, Search, Download, Clock
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
}: JarvisProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('jarvis_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('jarvis_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiMode, setAiMode] = useState<'general' | 'study' | 'coding'>('general');
  const [attachedImage, setAttachedImage] = useState<{ name: string; mimeType: string; data: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on Chat message streams
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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
    };
    reader.readAsDataURL(file);
  };

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

    try {
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
          agentType: aiMode,
          enableSearch: false,
          image: attachedImage
        }),
      });

      const rdata = await res.json();
      if (rdata.error) throw new Error(rdata.error);

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}-a`,
        role: 'assistant',
        content: rdata.text,
      };

      setMessages(prev => [...prev, botMsg]);
      setAttachedImage(null);

    } catch (err: any) {
      console.error(err);
      
      const errBotMsg: ChatMessage = {
        id: `m-${Date.now()}-err`,
        role: 'assistant',
        content: `Error: I encountered a communication blockage: ${err.message || 'Server timeout'}. Please verify connection integrity.`
      };
      setMessages(prev => [...prev, errBotMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const exportChatHistoryTxt = () => {
    try {
      const textContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jarvis_chat_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting chat history:', e);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-[100dvh] w-full flex bg-[#0f0f13] text-slate-300 font-sans overflow-hidden selection:bg-sky-500/30">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Chat History */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        w-[280px] md:w-64 lg:w-72 bg-[#0a0a0c] border-r border-slate-800/50 flex flex-col shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-slate-200 tracking-wide text-sm">JARVIS AI</h1>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                setMessages([]);
                setIsSidebarOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
            Recent Conversations
          </div>
          {/* Mock recent history, actually could group messages by session */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/40 text-slate-300 hover:bg-slate-800 transition-colors text-sm text-left">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate flex-1">Current Session</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800/50 space-y-3">
          <button
            onClick={exportChatHistoryTxt}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4 shrink-0" /> Export Conversation
          </button>
          
          <div className="pt-2 border-t border-slate-800/50">
            <select
              value={selectedTheme}
              onChange={(e) => onChangeTheme?.(e.target.value as any)}
              className="w-full bg-[#111116] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-sky-500 transition-colors"
            >
              <option value="cyan">Cyber Cyan</option>
              <option value="red">Stark Red</option>
              <option value="purple">Quantum Violet</option>
              <option value="gold">Omega Gold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0 h-[100dvh]">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800/50 bg-[#0f0f13]/80 backdrop-blur-md sticky top-0 z-20">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-semibold text-slate-200">JARVIS</div>
          <button 
            onClick={() => setMessages([])}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-xl">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-200">How can I assist you today?</h2>
                <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                  I am JARVIS, an advanced AI assistant. I can help you synthesize research, write code, solve problems, and analyze documents.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full pt-4 sm:pt-8 pb-36 sm:pb-40 space-y-4 sm:space-y-6">
              {messages.map((m, idx) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div key={m.id || idx} className={`px-3 sm:px-4 flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[95%] sm:max-w-[85%] flex gap-2 sm:gap-4 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
                      
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-auto mb-1 ${
                        isAssistant ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]' : 'bg-slate-800 text-slate-300 shadow-md'
                      }`}>
                        {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>

                      <div className={`flex flex-col min-w-0 ${isAssistant ? 'items-start' : 'items-end'}`}>
                        <div className="text-[11px] sm:text-xs text-slate-500 mb-1 px-1 font-medium tracking-wide uppercase">
                          {isAssistant ? 'JARVIS' : 'You'}
                        </div>
                        <div className={`px-4 sm:px-5 py-3 sm:py-4 rounded-2xl sm:rounded-[24px] text-sm sm:text-base leading-relaxed break-words shadow-sm relative ${
                          isAssistant 
                            ? 'bg-[#15151a] border border-slate-800 text-slate-300 rounded-bl-sm' 
                            : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-slate-200 rounded-br-sm'
                        }`}>
                          {isAssistant ? (
                            <>
                            <div className="markdown-body prose prose-sm sm:prose-base prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-slate-800 prose-code:text-sky-300 prose-headings:text-slate-200 prose-strong:text-slate-200 overflow-x-auto break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                              <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(m.content);
                                  // Optional: Add a brief toast or checkmark state here
                                }}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                Copy
                              </button>
                              <button 
                                onClick={() => {
                                  if ('speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(m.content);
                                    utterance.rate = 1.0;
                                    utterance.pitch = 1.0;
                                    window.speechSynthesis.speak(utterance);
                                  }
                                }}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                                Read
                              </button>
                            </div>
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="px-3 sm:px-4 flex w-full justify-start mt-4">
                  <div className="max-w-[85%] flex gap-2 sm:gap-4 flex-row">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500/10 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] flex items-center justify-center text-sky-400 flex-shrink-0 mt-auto mb-1">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <div className="text-[11px] sm:text-xs text-slate-500 mb-1 px-1 font-medium tracking-wide uppercase">
                        JARVIS
                      </div>
                      <div className="px-5 py-4 rounded-[24px] rounded-bl-sm bg-[#15151a] border border-slate-800 shadow-sm flex items-center h-[52px]">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-sky-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-sky-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-sky-500/50 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13] to-transparent pt-10 pb-4 sm:pb-6 px-3 sm:px-4">
          <div className="max-w-3xl mx-auto relative flex flex-col items-center">
            
            {/* Mode Selector */}
            <div className="flex bg-slate-900/60 backdrop-blur-md rounded-full p-1 mb-3 border border-slate-800/50">
              <button 
                onClick={() => setAiMode('general')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  aiMode === 'general' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jarvis General
              </button>
              <button 
                onClick={() => setAiMode('study')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                  aiMode === 'study' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Study Mode
              </button>
              <button 
                onClick={() => setAiMode('coding')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                  aiMode === 'coding' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Coding Mode
              </button>
            </div>

            <div className="w-full relative">
              {attachedImage && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center px-2">
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-lg max-w-full">
                  <Paperclip className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-300 truncate">{attachedImage.name}</span>
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (inputVal.trim() || attachedImage) {
                  sendMessage(inputVal);
                }
              }}
              className="relative bg-[#1a1a20]/80 backdrop-blur-xl border border-slate-700/80 hover:border-slate-600 transition-all rounded-[20px] sm:rounded-[28px] shadow-2xl flex items-end p-1.5 sm:p-2 focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/20"
            >
              <div className="relative mb-0.5 sm:mb-1 ml-0.5 sm:ml-1 flex flex-col sm:flex-row">
                <label 
                  htmlFor="file-upload" 
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-sky-400 cursor-pointer flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl hover:bg-slate-800/80 transition-all"
                  title="Attach Image"
                >
                  <Paperclip className="w-5 h-5" />
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadChange}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => {
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
                      
                      recognition.onerror = (event: any) => {
                        console.error("Speech recognition error", event.error);
                      };
                      
                      recognition.start();
                    } else {
                      alert("Voice input is not supported in this browser.");
                    }
                  }}
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-sky-400 cursor-pointer flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl hover:bg-slate-800/80 transition-all"
                  title="Voice Input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </button>
              </div>

              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputVal.trim() || attachedImage) {
                      sendMessage(inputVal);
                    }
                  }
                }}
                placeholder="Message JARVIS..."
                className="flex-1 max-h-32 sm:max-h-48 min-h-[44px] bg-transparent text-slate-200 px-3 py-3 sm:py-3.5 outline-none resize-none overflow-y-auto leading-relaxed text-sm sm:text-base placeholder-slate-500"
                rows={1}
                style={{ height: 'auto' }}
                disabled={isThinking}
              />

              <button
                type="submit"
                disabled={(!inputVal.trim() && !attachedImage) || isThinking}
                className="p-2.5 sm:p-3 text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl sm:rounded-2xl flex-shrink-0 transition-all flex items-center justify-center m-1 cursor-pointer shadow-md disabled:shadow-none mb-1 sm:mb-1.5 mr-1 sm:mr-1.5"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
            <div className="text-center mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500 px-4">
              JARVIS can make mistakes. Consider verifying important information.
            </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

