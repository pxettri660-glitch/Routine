import { useState, useRef, useEffect, useCallback } from 'react';
import { useFirestoreCollection } from '../../../hooks/useFirestoreSync';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
}

export function useJarvisChat(aiMode: 'general' | 'study' | 'coding' | 'automation', selectedModel: string) {
  const [messages, setMessages] = useFirestoreCollection<ChatMessage>('chat_messages', []);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  
  const handleImageUploadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const sendMessage = useCallback(async (textToSend: string) => {
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

      // Route to NEXUS specific API if in automation mode
      const endpoint = aiMode === 'automation' ? '/api/nexus/command' : '/api/gemini/chat';

      const res = await fetch(endpoint, {
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
  }, [messages, aiMode, attachedImage, selectedModel, setMessages]);

  const clearHistory = useCallback(() => {
    if (confirm("Are you sure you want to clear the entire chat history?")) {
      setMessages([]);
    }
  }, [setMessages]);

  const exportChat = useCallback(() => {
    try {
      const textContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexus_export_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {}
  }, [messages]);

  const handleVoiceInput = useCallback(() => {
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
  }, []);

  return {
    messages,
    setMessages,
    inputVal,
    setInputVal,
    isThinking,
    attachedImage,
    setAttachedImage,
    handleImageUploadChange,
    sendMessage,
    clearHistory,
    exportChat,
    handleVoiceInput
  };
}
