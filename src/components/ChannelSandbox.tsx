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
  ChevronDown
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
    name: 'University Academic Advisor',
    desc: 'Advises students on course prereqs, graduation, and capstone registration.',
    prompt: 'You are an experienced and empathetic academic advisor for the University School of Computing. You provide clear, actionable guidance on degree requirements, CS courses, graduation credits, and capstone prerequisites.',
    samples: [
      'What are the prerequisites for the CS499 Capstone Project?',
      'Can I take Operating Systems and Algorithms in the same semester?',
      'How do I request an elective credit transfer from my internship?'
    ]
  },
  {
    id: 'it-support',
    name: 'Campus IT & Lab Helpdesk',
    desc: 'Troubleshoots student credentials, VPN, GPU lab clusters, and Git repos.',
    prompt: 'You are a technical support specialist for the campus computer lab. You assist students with SSH keys, Git configuration, GPU compute cluster access, and campus Wi-Fi troubleshooting.',
    samples: [
      'How do I configure my SSH key to push to our team repository?',
      'How can I allocate a GPU node on the university compute cluster?',
      'My campus VPN connection keeps dropping on port 443.'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Orders Assistant',
    desc: 'Handles customer inquiries, tracking numbers, refunds, and product lookup.',
    prompt: 'You are a customer experience chatbot for an online tech retailer. Assist customers with tracking shipments, refund policies, warranties, and product compatibility.',
    samples: [
      'Where is my order #TX-90412 shipped to?',
      'What is your return policy on developer laptops?',
      'Do you offer academic student discounts on hardware?'
    ]
  },
  {
    id: 'universal',
    name: 'OmniCore Universal Agent',
    desc: 'General purpose system integration assistant with API knowledge.',
    prompt: 'You are OmniCore, a high-performance universal conversational agent designed to bridge multiple messaging surfaces and enterprise webhooks.',
    samples: [
      'Explain how the channel normalization gateway works in OmniCore.',
      'Show me how to format an outgoing response for Slack BlockKit.',
      'What are the security best practices for webhook HMAC verification?'
    ]
  }
];

const CHANNELS = [
  { id: 'web', name: 'Web Widget', icon: Globe, badge: 'Standard HTML/React' },
  { id: 'rest-api', name: 'REST Client', icon: Cpu, badge: 'cURL / Python / Node' },
  { id: 'slack', name: 'Slack Channel', icon: Hash, badge: 'BlockKit Output' },
  { id: 'discord', name: 'Discord Server', icon: MessageSquare, badge: 'Rich Embed' },
];

export const ChannelSandbox: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedChannel, setSelectedChannel] = useState<string>('web');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('academic');
  const [systemPrompt, setSystemPrompt] = useState<string>(PRESET_PERSONAS[0].prompt);
  const [knowledgeBase, setKnowledgeBase] = useState<string>('CS499 Capstone Project proposal deadline: November 15. Requires completion of CS350 and CS330 with C or higher.');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [userId, setUserId] = useState<string>('student_4019');
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
      text: "👋 Welcome to the **OmniCore Universal Chatbot Sandbox**!\n\nThis interface demonstrates real-time normalization across channels. You can switch personas, change the target channel (Web, Slack, Discord, REST), inject custom knowledge snippets, or inspect the underlying gateway payload in real time.",
      channel: 'web',
      timestamp: Date.now() - 2000,
      latencyMs: 120,
      tokens: { promptTokens: 40, responseTokens: 35, totalTokens: 75 },
      provider: 'OmniCore Gateway'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

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

    const historyPayload = messages
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }],
      }));

    const finalSystemPrompt = knowledgeBase.trim()
      ? `${systemPrompt}\n\n[Knowledge Base Context / Directives]:\n${knowledgeBase}`
      : systemPrompt;

    const inboundRequest = {
      message: text,
      channel: selectedChannel,
      userId,
      sessionId,
      systemPrompt: finalSystemPrompt,
      temperature,
      history: historyPayload,
      metadata: {
        clientTimestamp: Date.now(),
        clientAgent: 'OmniCore-Sandbox/1.0',
        knowledgeBaseAttached: Boolean(knowledgeBase.trim()),
      },
    };

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inboundRequest),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const botData = json.data;
        const botMsg: ChatMessage = {
          id: botData.messageId || `bot_${Date.now()}`,
          sender: 'bot',
          text: botData.reply,
          channel: botData.channel,
          timestamp: botData.timestamp || Date.now(),
          latencyMs: botData.latencyMs,
          tokens: botData.tokens,
          provider: botData.provider,
          rawPayload: inboundRequest,
          channelOutput: botData.channelOutput,
          ragSources: botData.ragSources,
        };

        setMessages((prev) => [...prev, botMsg]);
        setInspectedPayload({
          inbound: inboundRequest,
          outbound: botData,
        });

        if (speechEnabled) {
          speakText(botData.reply);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Gateway Error: ${json.error?.message || 'Failed to process request.'}`,
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
          text: `❌ Connection Error: Could not connect to /api/v1/chat (${err.message})`,
          channel: selectedChannel,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser engine. Chrome or Edge is recommended.');
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
    let filename = `OmniCore-Session-${sessionId}`;

    if (format === 'markdown') {
      output = `# OmniCore Chat Session: ${sessionId}\nChannel: ${selectedChannel} | Persona: ${selectedPersonaId}\nDate: ${new Date().toLocaleString()}\n\n---\n\n`;
      messages.forEach((m) => {
        output += `### ${m.sender === 'user' ? 'Student / User' : 'OmniCore Assistant'} (${new Date(m.timestamp).toLocaleTimeString()})\n${m.text}\n\n`;
        if (m.ragSources && m.ragSources.length > 0) {
          output += `> **Cited Sources:** ${m.ragSources.map((s) => `${s.title} (${Math.round(s.similarity * 100)}%)`).join(', ')}\n\n`;
        }
      });
      filename += '.md';
    } else if (format === 'html') {
      output = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OmniCore Transcript - ${sessionId}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b;background:#f8fafc}.header{border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px}.badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:#e0e7ff;color:#4338ca}.msg{padding:16px;border-radius:12px;margin-bottom:16px}.user{background:#e0e7ff;border:1px solid #c7d2fe}.bot{background:#fff;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.sender{font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:6px}.rag{font-size:11px;color:#0891b2;margin-top:8px;padding-top:8px;border-top:1px dashed #e2e8f0;font-family:monospace}</style></head><body><div class="header"><h1>OmniCore Session Transcript</h1><p><span class="badge">Session: ${sessionId}</span> &bull; <strong>Channel:</strong> ${selectedChannel} &bull; <strong>Date:</strong> ${new Date().toLocaleString()}</p></div>${messages.map(m => `<div class="msg ${m.sender}"><div class="sender">${m.sender === 'user' ? 'User' : 'OmniCore Assistant'} &bull; ${new Date(m.timestamp).toLocaleTimeString()}</div><div>${m.text.replace(/\n/g, '<br/>')}</div>${m.ragSources ? `<div class="rag">Cited RAG: ${m.ragSources.map(s => `${s.title} (${Math.round(s.similarity * 100)}%)`).join(' | ')}</div>` : ''}</div>`).join('')}</body></html>`;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Channels & Configuration Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        {/* Channel Selector */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Target Channel Simulator</span>
            </h3>
            <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Normalized Egress</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm ring-1 ring-indigo-500/30'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold">{ch.name}</span>
                  </div>
                  <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ch.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Selector */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>System Persona &amp; Directive</span>
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowKnowledge(!showKnowledge)}
                className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                  showKnowledge ? 'bg-indigo-500/20 text-indigo-400 font-bold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Inject domain knowledge context"
              >
                + Knowledge
              </button>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center space-x-1 font-medium"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showConfig ? 'Hide' : 'Tune'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {PRESET_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handlePersonaChange(persona.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                  selectedPersonaId === persona.id
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  selectedPersonaId === persona.id ? 'bg-indigo-400' : 'bg-slate-600'
                }`} />
                <div>
                  <div className="text-xs font-medium text-white">{persona.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{persona.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Knowledge Context Drawer */}
          {showKnowledge && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-indigo-300 flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Knowledge Base Ingestion (RAG Grounding)</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Custom Rules</span>
              </label>
              <textarea
                rows={3}
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                placeholder="Paste course syllabus notes, policy snippet, or API schema here..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                The bot immediately incorporates this text into its responses.
              </span>
            </div>
          )}

          {/* Config Drawer */}
          {showConfig && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  System Instruction Prompt
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Session ID</label>
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-300 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Queries */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className={`text-xs font-semibold mb-2 flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span>Pre-configured Test Prompts</span>
            <span className="text-[10px] text-slate-400">Click to send</span>
          </div>
          <div className="space-y-1.5">
            {currentPersona.samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sample)}
                disabled={loading}
                className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors block truncate ${
                  isDark
                    ? 'bg-slate-800/40 hover:bg-indigo-950/40 hover:border-indigo-800 border-slate-800 text-slate-300'
                    : 'bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border-slate-200 text-slate-700'
                }`}
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Chat Canvas */}
      <div className={`lg:col-span-8 flex flex-col h-[740px] border rounded-2xl shadow-xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/60'
      }`}>
        {/* Chat Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              selectedChannel === 'slack'
                ? 'bg-[#4A154B] text-white'
                : selectedChannel === 'discord'
                ? 'bg-[#5865F2] text-white'
                : 'bg-indigo-600 text-white'
            }`}>
              {selectedChannel === 'slack' ? <Hash className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentPersona.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  via #{selectedChannel}
                </span>
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Session: {sessionId}</span>
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
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                speechEnabled ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={speechEnabled ? 'Mute Speech Synthesis' : 'Enable Voice Audio Output'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Export Menu with Multi-Format Options */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-xs p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-1"
                title="Export Conversation Transcript"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-800 bg-slate-900 shadow-xl p-1.5 space-y-1 text-xs">
                  <button
                    onClick={() => exportChatSession('markdown')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center space-x-2 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => exportChatSession('html')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center space-x-2 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Printable HTML (.html)</span>
                  </button>
                  <button
                    onClick={() => exportChatSession('json')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center space-x-2 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Raw Session JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Payload Inspector Button */}
            {inspectedPayload && (
              <button
                onClick={() => setInspectedPayload(inspectedPayload ? null : inspectedPayload)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono flex items-center space-x-1"
                title="Inspect Universal Gateway JSON Payload"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Bot className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No messages yet in this session.</p>
              <p className="text-xs max-w-sm mt-1">
                Type a message or select a test prompt from the sidebar to verify the {selectedChannel} adapter.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              // Slack Style Card
              if (selectedChannel === 'slack' && isBot) {
                return (
                  <div key={msg.id} className="flex space-x-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                    <div className="w-9 h-9 rounded bg-[#4A154B] flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      BOT
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-200">OmniCore App</span>
                          <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">APP</span>
                          <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="hover:text-white transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="hover:text-white transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed font-sans mt-1">
                        <MarkdownRenderer content={msg.text} />
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center space-x-3">
                          <span>BlockKit Egress</span>
                          {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                          {msg.tokens && <span>{msg.tokens.totalTokens} tokens</span>}
                        </div>
                        <span className="text-indigo-400">{msg.provider || 'Gateway'}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Discord Style Card
              if (selectedChannel === 'discord' && isBot) {
                return (
                  <div key={msg.id} className="flex space-x-3 p-3.5 bg-[#313338]/90 border border-[#2b2d31] rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      🤖
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#f2f3f5]">OmniCore Discord Bot</span>
                          <span className="text-[10px] px-1 rounded bg-[#5865f2] text-white font-medium">BOT</span>
                          <span className="text-[10px] text-[#949ba4]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="hover:text-white transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="hover:text-white transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="border-l-4 border-[#5865F2] pl-3 py-1 bg-[#2b2d31]/60 rounded-r-lg mt-1">
                        <div className="text-slate-200 leading-relaxed font-sans">
                          <MarkdownRenderer content={msg.text} />
                        </div>
                        <div className="mt-2 text-[10px] text-[#949ba4] font-mono flex items-center space-x-2">
                          <span>Discord Embed • {msg.latencyMs}ms</span>
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
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-sm ${
                      isBot
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-indigo-600 text-white rounded-br-none'
                    }`}
                  >
                    {isBot ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                    )}

                    {/* RAG Institutional Knowledge Citations */}
                    {isBot && msg.ragSources && msg.ragSources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center space-x-1 text-[11px] text-cyan-400 font-semibold mb-1">
                          <Database className="w-3 h-3" />
                          <span>Cited Knowledge Base:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.ragSources.map((src) => (
                            <span
                              key={src.id}
                              className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono flex items-center space-x-1"
                              title={src.snippet}
                            >
                              <span>{src.title}</span>
                              <span className="text-cyan-300 font-bold">({Math.round(src.similarity * 100)}%)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isBot && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center space-x-3">
                          {msg.latencyMs && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{msg.latencyMs}ms</span>
                            </span>
                          )}
                          {msg.tokens && <span>• {msg.tokens.totalTokens} toks</span>}
                          <span className="text-indigo-400">{msg.provider || 'Gateway'}</span>
                        </div>

                        {/* Interactive Message Toolbar */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => copyMessage(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Speak out loud"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rateMessage(msg.id, 'up')}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              msg.rating === 'up' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rateMessage(msg.id, 'down')}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              msg.rating === 'down' ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Poor response"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Normalizing request & querying Gemini pipeline...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* In-App Gateway Payload Inspector */}
        {inspectedPayload && (
          <div className="border-t border-slate-800 bg-slate-950 p-3 max-h-52 overflow-y-auto font-mono text-[11px] text-slate-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-indigo-400 flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5" />
                <span>Live Universal Gateway Payload (POST /api/v1/chat)</span>
              </span>
              <button
                onClick={copyPayloadJson}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="text-[10px] leading-tight text-slate-400 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
              {JSON.stringify(inspectedPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Send message to OmniCore via ${selectedChannel} adapter...`}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={startVoiceDictation}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/30'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isRecording ? 'Listening to voice... Click or speak now' : 'Click to dictate via Voice Speech Input'}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Inbound format: Canonical UniversalMessage</span>
            <span>Egress format: {selectedChannel.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
