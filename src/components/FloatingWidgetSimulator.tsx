import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

export const FloatingWidgetSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hi there! 👋 I am the **OmniCore Web Embed Widget**. You can drop me onto any website with a single `<script>` tag.',
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || loading) return;

    const userTurn = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userTurn]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          channel: 'web',
          sessionId: 'widget_embed_session',
          systemPrompt: 'You are the embedded web assistant for OmniCore. Keep responses concise, friendly, and structured.',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Error connecting to the gateway. Please ensure the server is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Widget Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center space-x-1.5">
                  <span>Campus Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-indigo-100 font-mono">OmniCore Web Embed</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Close widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <MarkdownRenderer content={m.text} />
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-[11px]">Assistant is generating response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative border border-white/20"
        title="Open Live Embedded Web Widget"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-950"></span>
          </span>
        )}
      </button>
    </div>
  );
};
