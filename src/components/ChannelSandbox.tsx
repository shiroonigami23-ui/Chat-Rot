import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Globe, 
  Hash, 
  MessageSquare, 
  Cpu, 
  Sliders, 
  Code2, 
  Trash2, 
  Clock, 
  Layers, 
  Check, 
  Copy, 
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Download,
  BookOpen,
  Settings2,
  RefreshCw,
  Mic,
  MicOff,
  Database,
  FileText,
  ChevronDown,
  Smile,
  GraduationCap,
  ShieldCheck,
  Terminal,
  Zap,
  Package
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  channel: string;
  timestamp: number;
  latencyMs?: number;
  tokens?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  provider?: string;
  rawPayload?: any;
  channelOutput?: any;
  rating?: 'up' | 'down';
  ragSources?: Array<{
    id: string;
    title: string;
    category: string;
    similarity: number;
    snippet: string;
  }>;
}

const PRESET_PERSONAS = [
  {
    id: 'academic',
    name: 'Academic Advisor',
    roleTag: 'Student Support',
    accentColor: 'from-amber-500 to-orange-500',
    desc: 'Advises on degree requirements, course electives, and capstone registration.',
    prompt: 'You are an experienced and empathetic academic advisor for the School of Computing. You provide clear, actionable guidance on degree requirements, CS courses, graduation credits, and capstone prerequisites. Keep your tone cheerful, encouraging, and constructive.',
    samples: [
      'What are the prerequisites for the CS499 Capstone Project?',
      'Can I take Operating Systems and Algorithms in the same semester?',
      'How do I request an elective credit transfer from my internship?'
    ]
  },
  {
    id: 'it-support',
    name: 'Campus IT Helpdesk',
    roleTag: 'Lab & Infrastructure',
    accentColor: 'from-emerald-500 to-teal-500',
    desc: 'Assists with campus credentials, VPN, GPU lab clusters, and Git repos.',
    prompt: 'You are a cheerful and resourceful technical support specialist for the campus engineering lab. You assist students with SSH keys, Git configuration, GPU compute cluster access, and campus Wi-Fi troubleshooting. Provide clear step-by-step instructions.',
    samples: [
      'How do I configure my SSH key to push to our team repository?',
      'How can I allocate a GPU node on the university compute cluster?',
      'My campus VPN connection keeps dropping on port 443.'
    ]
  },
  {
    id: 'ecommerce',
    name: 'Store & Orders Assistant',
    roleTag: 'Retail & Hardware',
    accentColor: 'from-sky-500 to-blue-500',
    desc: 'Assists with order lookups, developer hardware discounts, and warranties.',
    prompt: 'You are a cheerful customer experience chatbot for an online tech retailer. Assist customers with tracking shipments, refund policies, warranties, and student hardware discounts with a helpful, friendly tone.',
    samples: [
      'Where is my order #TX-90412 shipped to?',
      'What is your return policy on developer laptops?',
      'Do you offer academic student discounts on hardware?'
    ]
  },
  {
    id: 'universal',
    name: 'ChatRot Specialist',
    roleTag: 'Gateway & Architecture',
    accentColor: 'from-indigo-500 to-purple-500',
    desc: 'Technical chatbot assistant with multi-channel gateway, webhook, and API knowledge.',
    prompt: 'You are ChatRot Assistant, a clean, direct, and professional technical chatbot designed to support multi-channel messaging and developer integrations. You provide clear, concise, accurate, and cheerful responses without excessive filler.',
    samples: [
      'How does the channel normalization gateway work?',
      'Format an outgoing response for Slack BlockKit.',
      'Explain HMAC verification for webhook security.'
    ]
  }
];

const CHANNELS = [
  { id: 'web', name: 'Web Widget', icon: Globe, badge: 'Standard HTML/React', color: 'text-blue-500 bg-blue-500/10' },
  { id: 'rest-api', name: 'REST Client', icon: Cpu, badge: 'cURL / Python / Node', color: 'text-amber-500 bg-amber-500/10' },
  { id: 'slack', name: 'Slack Channel', icon: Hash, badge: 'BlockKit Output', color: 'text-fuchsia-600 bg-fuchsia-500/10' },
  { id: 'discord', name: 'Discord Server', icon: MessageSquare, badge: 'Rich Embed', color: 'text-indigo-500 bg-indigo-500/10' },
];

export const ChannelSandbox: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedChannel, setSelectedChannel] = useState<string>('web');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('academic');
  const [systemPrompt, setSystemPrompt] = useState<string>(PRESET_PERSONAS[0].prompt);
  const [knowledgeBase, setKnowledgeBase] = useState<string>('CS499 Capstone Project proposal deadline: November 15. Requires completion of CS350 and CS330 with C or higher.');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [sessionId, setSessionId] = useState<string>(`sess_${Date.now().toString(36).slice(-6)}`);
  
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showKnowledge, setShowKnowledge] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);
  const [inspectedPayload, setInspectedPayload] = useState<{ inbound: any; outbound: any } | null>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "👋 **Hello there! Welcome to ChatRot!**\n\nI'm your intelligent multi-channel assistant. Test live messaging, inspect normalized payloads across **Web**, **Slack**, **Discord**, and **REST APIs**, or query institutional knowledge documents.\n\nPick a quick starter below or type your own question to begin!",
      channel: 'web',
      timestamp: Date.now() - 2000,
      latencyMs: 82,
      tokens: { promptTokens: 32, responseTokens: 28, totalTokens: 60 },
      provider: 'ChatRot Gateway'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersonaId(personaId);
    const p = PRESET_PERSONAS.find((x) => x.id === personaId);
    if (p) {
      setSystemPrompt(p.prompt);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      channel: selectedChannel,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          channel: selectedChannel,
          sessionId,
          systemPrompt,
          knowledgeContext: knowledgeBase,
          temperature,
        }),
      });

      const json = await response.json();
      const latency = Date.now() - startTime;

      if (json.success && json.data) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: json.data.reply,
          channel: selectedChannel,
          timestamp: Date.now(),
          latencyMs: json.data.latencyMs || latency,
          tokens: json.data.tokens,
          provider: json.data.provider,
          rawPayload: json.data.rawInboundPayload,
          channelOutput: json.data.channelEgress,
          ragSources: json.data.ragSources || [],
        };

        setMessages((prev) => [...prev, botMsg]);
        setInspectedPayload({
          inbound: json.data.rawInboundPayload,
          outbound: json.data.channelEgress,
        });

        if (speechEnabled) {
          speakText(json.data.reply);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Gateway notice: ${json.error?.message || 'Could not process request.'}`,
          channel: selectedChannel,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: `❌ Connection error: Could not connect to /api/v1/chat (${err.message})`,
          channel: selectedChannel,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is supported in Chrome, Edge, and Safari.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1500);
  };

  const rateMessage = (id: string, rating: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, rating } : m))
    );
    fetch('/api/v1/analytics/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: id, rating }),
    }).catch(() => {});
  };

  const exportChatSession = (format: 'markdown' | 'json' | 'html') => {
    let output = '';
    let mimeType = 'text/plain';
    let filename = `ChatRot-Session-${sessionId}`;

    if (format === 'markdown') {
      output = `# ChatRot Chat Session: ${sessionId}\nChannel: ${selectedChannel} | Persona: ${selectedPersonaId}\nDate: ${new Date().toLocaleString()}\n\n---\n\n`;
      messages.forEach((m) => {
        output += `### ${m.sender === 'user' ? 'User' : 'ChatRot Assistant'} (${new Date(m.timestamp).toLocaleTimeString()})\n${m.text}\n\n`;
        if (m.ragSources && m.ragSources.length > 0) {
          output += `> **Cited Sources:** ${m.ragSources.map((s) => `${s.title} (${Math.round(s.similarity * 100)}%)`).join(', ')}\n\n`;
        }
      });
      filename += '.md';
    } else if (format === 'html') {
      output = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ChatRot Transcript - ${sessionId}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b;background:#f8fafc}.header{border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px}.badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:#e0e7ff;color:#4338ca}.msg{padding:16px;border-radius:12px;margin-bottom:16px}.user{background:#e0e7ff;border:1px solid #c7d2fe}.bot{background:#fff;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.sender{font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:6px}.rag{font-size:11px;color:#0891b2;margin-top:8px;padding-top:8px;border-top:1px dashed #e2e8f0;font-family:monospace}</style></head><body><div class="header"><h1>ChatRot Session Transcript</h1><p><span class="badge">Session: ${sessionId}</span> &bull; <strong>Channel:</strong> ${selectedChannel} &bull; <strong>Date:</strong> ${new Date().toLocaleString()}</p></div>${messages.map(m => `<div class="msg ${m.sender}"><div class="sender">${m.sender === 'user' ? 'User' : 'ChatRot Assistant'} &bull; ${new Date(m.timestamp).toLocaleTimeString()}</div><div>${m.text.replace(/\n/g, '<br/>')}</div>${m.ragSources ? `<div class="rag">Cited Knowledge: ${m.ragSources.map(s => `${s.title} (${Math.round(s.similarity * 100)}%)`).join(' | ')}</div>` : ''}</div>`).join('')}</body></html>`;
      mimeType = 'text/html';
      filename += '.html';
    } else {
      output = JSON.stringify({ sessionId, channel: selectedChannel, messages }, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    }

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const currentPersona = PRESET_PERSONAS.find((p) => p.id === selectedPersonaId) || PRESET_PERSONAS[0];

  const copyPayloadJson = () => {
    if (!inspectedPayload) return;
    navigator.clipboard.writeText(JSON.stringify(inspectedPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const quickChips = [
    { label: 'CS499 Prerequisites', icon: GraduationCap, query: 'What are the prerequisites for the CS499 Capstone Project?' },
    { label: 'Test Response Latency', icon: Zap, query: 'Run a live channel response latency check and verify throughput.' },
    { label: 'HMAC Webhook Auth', icon: ShieldCheck, query: 'Explain how HMAC signature verification secures inbound webhooks.' },
    { label: 'GitHub Packages Setup', icon: Package, query: 'How do I install and publish packages with @shiroonigami23-ui/chat-rot?' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Channels & Configuration Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        {/* Channel Selector */}
        <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className={`text-sm font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Channel Simulator</span>
            </h3>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
              isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600 font-medium'
            }`}>
              Live Egress
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-500 text-blue-950 shadow-sm ring-1 ring-blue-500/30'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`p-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : ch.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold">{ch.name}</span>
                  </div>
                  <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ch.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Selector */}
        <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className={`text-sm font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Persona &amp; Knowledge</span>
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowKnowledge(!showKnowledge)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  showKnowledge 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Inject domain knowledge context"
              >
                + Knowledge
              </button>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                  showConfig 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Tune</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {PRESET_PERSONAS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaChange(persona.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-800/80 border-blue-500/40 text-white shadow-sm'
                        : 'bg-gradient-to-r from-blue-50/70 to-indigo-50/40 border-blue-300 text-slate-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-800/30 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${persona.accentColor} text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs`}>
                    {persona.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{persona.name}</div>
                      <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{persona.roleTag}</span>
                    </div>
                    <div className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{persona.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Knowledge Context Drawer */}
          {showKnowledge && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className={`text-xs font-bold flex items-center justify-between mb-1.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Custom Knowledge Context (RAG)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Real-time Injection</span>
              </label>
              <textarea
                rows={3}
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                placeholder="Paste course syllabus notes, policy snippet, or API schema here..."
                className={`w-full text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 font-mono border transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900 shadow-inner'
                }`}
              />
              <span className={`text-[10px] block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                The model cites this text in responses with source badges.
              </span>
            </div>
          )}

          {/* Config Drawer */}
          {showConfig && (
            <div className={`mt-4 pt-4 border-t space-y-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  System Instruction Prompt
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className={`w-full text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 font-mono border transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-200' 
                      : 'bg-white border-slate-300 text-slate-900 shadow-inner'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Temperature</span>
                    <span className="font-mono font-bold text-blue-500">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <span className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Session ID</span>
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className={`w-full rounded-lg p-1.5 font-mono text-[11px] border focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Queries */}
        <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Recommended Prompts
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1-Click Try</span>
          </div>
          <div className="space-y-1.5">
            {currentPersona.samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sample)}
                disabled={loading}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all block truncate ${
                  isDark
                    ? 'bg-slate-800/40 hover:bg-blue-950/40 hover:border-blue-700/60 border-slate-800 text-slate-300'
                    : 'bg-slate-50/80 hover:bg-blue-50/80 hover:border-blue-300 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Chat Canvas */}
      <div className={`lg:col-span-8 flex flex-col h-[760px] border rounded-2xl shadow-xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 shadow-slate-950/60' : 'bg-white border-slate-200 shadow-slate-200/60'
      }`}>
        {/* Chat Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between transition-colors ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800' 
            : 'bg-gradient-to-r from-blue-50/60 via-white to-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white ${
              selectedChannel === 'slack'
                ? 'bg-[#4A154B]'
                : selectedChannel === 'discord'
                ? 'bg-[#5865F2]'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
            }`}>
              {selectedChannel === 'slack' ? <Hash className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentPersona.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                }`}>
                  #{selectedChannel}
                </span>
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Session: {sessionId}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Speech Toggle */}
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-2 rounded-xl text-xs font-mono transition-all border ${
                speechEnabled 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                  : isDark ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
              }`}
              title={speechEnabled ? 'Mute voice audio output' : 'Enable voice audio synthesis'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Export Menu with Multi-Format Options */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`text-xs p-2 rounded-xl border transition-all flex items-center space-x-1 ${
                  isDark ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                }`}
                title="Export conversation transcript"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 top-10 z-30 w-48 rounded-2xl border shadow-xl p-2 space-y-1 text-xs ${
                  isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-800 shadow-slate-200/80'
                }`}>
                  <button
                    onClick={() => exportChatSession('markdown')}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-blue-50 text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => exportChatSession('html')}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Printable HTML (.html)</span>
                  </button>
                  <button
                    onClick={() => exportChatSession('json')}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-amber-50 text-slate-700'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-amber-500" />
                    <span>Raw JSON (.json)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Payload Inspector Button */}
            {inspectedPayload && (
              <button
                onClick={() => setInspectedPayload(inspectedPayload ? null : inspectedPayload)}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-mono flex items-center space-x-1 border transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
                title="Inspect Universal Gateway JSON Payload"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            <button
              onClick={() => setMessages([])}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className={`flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-slate-950/60 to-slate-950/90' 
            : 'bg-gradient-to-b from-slate-50/50 via-white to-blue-50/20'
        }`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4 animate-bounce">
                <Smile className="w-8 h-8" />
              </div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                How can I help you today?
              </h4>
              <p className={`text-xs mt-1.5 mb-6 max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ChatRot is connected and ready to normalize messages across Web, Slack, Discord, and REST endpoints.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {quickChips.map((chip, i) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip.query)}
                      className={`p-3 rounded-xl border text-xs transition-all flex items-center space-x-2.5 ${
                        isDark 
                          ? 'bg-slate-800/60 border-slate-700/80 hover:bg-blue-950/40 hover:border-blue-500 text-slate-200' 
                          : 'bg-white border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 shadow-xs'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-semibold truncate">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              // Slack Style Card
              if (selectedChannel === 'slack' && isBot) {
                return (
                  <div key={msg.id} className={`flex space-x-3.5 p-4 rounded-2xl border transition-colors ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-9 h-9 rounded-xl bg-[#4A154B] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm">
                      #
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ChatRot Bot</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A154B]/10 text-[#4A154B] font-mono font-bold">SLACK</span>
                          <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`leading-relaxed font-sans mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <MarkdownRenderer content={msg.text} />
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center space-x-3">
                          <span>BlockKit Egress</span>
                          {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                        </div>
                        <span className="text-blue-500 font-bold">{msg.provider || 'ChatRot Gateway'}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Discord Style Card
              if (selectedChannel === 'discord' && isBot) {
                return (
                  <div key={msg.id} className={`flex space-x-3.5 p-4 rounded-2xl border transition-colors ${
                    isDark ? 'bg-[#313338]/90 border-[#2b2d31]' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm">
                      🤖
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isDark ? 'text-[#f2f3f5]' : 'text-slate-900'}`}>ChatRot</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5865f2] text-white font-bold">APP</span>
                          <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`border-l-4 border-[#5865F2] pl-3.5 py-1 rounded-r-xl mt-1 ${
                        isDark ? 'bg-[#2b2d31]/70 text-slate-200' : 'bg-blue-50/50 text-slate-800'
                      }`}>
                        <MarkdownRenderer content={msg.text} />
                        <div className="mt-2 text-[10px] text-slate-400 font-mono">
                          Discord Rich Embed • {msg.latencyMs}ms
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Modern Web / REST Chat
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs transition-all ${
                      isBot
                        ? isDark
                          ? 'bg-slate-900 border border-slate-800 text-slate-100 shadow-sm'
                          : 'bg-white border border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/40'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-blue-600/20 font-medium'
                    }`}
                  >
                    {isBot ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                    )}

                    {/* Cited Knowledge Base Badges */}
                    {isBot && msg.ragSources && msg.ragSources.length > 0 && (
                      <div className={`mt-3 pt-2.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>Grounded Citations:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.ragSources.map((src) => (
                            <span
                              key={src.id}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center space-x-1 border ${
                                isDark 
                                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' 
                                  : 'bg-teal-50 text-teal-700 border-teal-200 font-semibold'
                              }`}
                              title={src.snippet}
                            >
                              <span>{src.title}</span>
                              <span className="text-teal-500 font-bold">({Math.round(src.similarity * 100)}%)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isBot && (
                      <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {msg.latencyMs && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{msg.latencyMs}ms</span>
                            </span>
                          )}
                          {msg.tokens && <span>• {msg.tokens.totalTokens} tokens</span>}
                          <span className="text-blue-500 font-semibold">{msg.provider || 'ChatRot'}</span>
                        </div>

                        {/* Interactive Message Toolbar */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => rateMessage(msg.id, 'up')}
                            className={`p-1 rounded-md transition-colors ${
                              msg.rating === 'up' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => rateMessage(msg.id, 'down')}
                            className={`p-1 rounded-md transition-colors ${
                              msg.rating === 'down' ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className={`rounded-2xl px-4 py-3 text-xs flex items-center space-x-2.5 shadow-sm border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <span className="font-medium">Formatting and dispatching across #{selectedChannel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* In-App Gateway Payload Inspector */}
        {inspectedPayload && (
          <div className={`border-t p-3.5 max-h-52 overflow-y-auto font-mono text-[11px] ${
            isDark ? 'border-slate-800 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-500 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4" />
                <span>Live Universal Gateway Payload (POST /api/v1/chat)</span>
              </span>
              <button
                onClick={copyPayloadJson}
                className={`text-[10px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className={`text-[10px] leading-tight overflow-x-auto p-2.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              {JSON.stringify(inspectedPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className={`px-4 pt-3 pb-1 flex flex-wrap items-center gap-1.5 border-t transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <span className={`text-[10px] font-semibold uppercase tracking-wider mr-1 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Quick:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              disabled={loading}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center space-x-1 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-blue-500 text-slate-300' 
                  : 'bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border-slate-200 text-slate-700'
              }`}
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ChatRot via ${selectedChannel} channel...`}
              disabled={loading}
              className={`flex-1 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all border ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 shadow-inner'
              }`}
            />
            <button
              type="button"
              onClick={startVoiceDictation}
              className={`p-3 rounded-2xl border transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-lg shadow-rose-500/30'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={isRecording ? 'Listening... speak clearly into your mic' : 'Dictate with voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-blue-600/25 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Canonical format: UniversalMessage</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
