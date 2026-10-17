import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  ExternalLink,
  BookOpen,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Radio,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  Hash,
  MessageSquare,
  Clock,
  ArrowRight,
  Send,
  Sliders
} from 'lucide-react';

const INTEGRATION_SNIPPETS = {
  widget: {
    title: 'Drop-In Web Widget (HTML / Vanilla JS)',
    lang: 'html',
    desc: 'Insert before the closing </body> tag of any website or CMS.',
    code: `<!-- 1. Include OmniCore Embed Script -->
<script 
  src="https://cdn.omnicore-bot.org/widget.js" 
  data-endpoint="http://localhost:3000/api/v1/chat"
  data-bot-name="Campus Advisor"
  data-channel="web"
  data-theme="dark"
  defer>
</script>

<!-- The widget injects a responsive, floating chat bubble on the bottom right -->`,
  },
  python: {
    title: 'Python Client (Requests / FastAPI / Django)',
    lang: 'python',
    desc: 'Clean Python class for backend integration or microservices.',
    code: `import requests
import uuid

class OmniCoreClient:
    def __init__(self, base_url="http://localhost:3000/api/v1", api_key=None):
        self.base_url = base_url.rstrip("/")
        self.session_id = f"py_{uuid.uuid4().hex[:6]}"
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["X-Bot-Token"] = api_key

    def ask(self, message: str, channel: str = "rest-api", system_prompt: str = None) -> dict:
        payload = {
            "message": message,
            "channel": channel,
            "sessionId": self.session_id,
            "systemPrompt": system_prompt
        }
        resp = requests.post(f"{self.base_url}/chat", json=payload, headers=self.headers, timeout=10)
        resp.raise_for_status()
        return resp.json()["data"]

# Example:
bot = OmniCoreClient(api_key="omni_live_admin_9841acb729e1")
result = bot.ask("What is the prerequisite for CS499?")
print(result["reply"])
print(f"Latency: {result['latencyMs']}ms | Tokens: {result['tokens']['totalTokens']}")`,
  },
  node: {
    title: 'Node.js / TypeScript SDK',
    lang: 'typescript',
    desc: 'Modern fetch/axios client for Node, Next.js, or Express backends.',
    code: `import axios from 'axios';

export class OmniCoreSDK {
  constructor(private baseUrl = 'http://localhost:3000/api/v1', private apiKey?: string) {}

  async chat(message: string, options: { channel?: string; sessionId?: string; systemPrompt?: string } = {}) {
    const res = await axios.post(\`\${this.baseUrl}/chat\`, {
      message,
      channel: options.channel || 'node-sdk',
      sessionId: options.sessionId || 'node_sess_default',
      systemPrompt: options.systemPrompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'X-Bot-Token': this.apiKey } : {})
      }
    });

    return res.data;
  }
}

// Usage:
const bot = new OmniCoreSDK('http://localhost:3000/api/v1', 'omni_live_admin_9841acb729e1');
const { data } = await bot.chat('Check system integration readiness');
console.log(data.reply);`,
  },
  reactHook: {
    title: 'React Custom Hook (useOmniBot.ts)',
    lang: 'typescript',
    desc: 'Ready-to-use React hook with state handling for SPA frontends.',
    code: `import { useState, useCallback } from 'react';

export function useOmniBot(apiBase = '/api/v1', apiKey?: string) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Bot-Token'] = apiKey;

      const res = await fetch(\`\${apiBase}/chat\`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, channel: 'web' })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.data.reply }]);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBase, apiKey]);

  return { messages, sendMessage, loading };
}`,
  },
  curl: {
    title: 'Direct cURL Command',
    lang: 'bash',
    desc: 'Test the universal endpoint directly from your terminal.',
    code: `curl -X POST http://localhost:3000/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-Bot-Token: omni_live_admin_9841acb729e1" \\
  -d '{
    "message": "Ping! Checking integration status.",
    "channel": "rest-api",
    "sessionId": "curl_terminal_01",
    "systemPrompt": "You are OmniCore test assistant."
  }'`,
  },
  webhook: {
    title: 'Slack / Discord Inbound Webhook Payload',
    lang: 'json',
    desc: 'How external platforms send normalized events to /api/v1/webhooks/:channel',
    code: `// POST http://localhost:3000/api/v1/webhooks/slack
{
  "type": "event_callback",
  "event": {
    "type": "app_mention",
    "user": "U98101",
    "text": "<@BOT> what time does the robotics lab open?",
    "channel": "C092834",
    "ts": "1729166000.001"
  }
}

// OmniCore normalizes the inbound event and automatically returns BlockKit JSON!`,
  },
};

type SnippetKey = keyof typeof INTEGRATION_SNIPPETS;

interface MockKeyItem {
  id: string;
  name: string;
  key: string;
  keyMasked?: string;
  prefix: string;
  tier: 'Developer' | 'Production' | 'Enterprise';
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  tenant: string;
  rateLimitPerMin: number;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
}

interface WebhookLogItem {
  id: string;
  channel: string;
  timestamp: number;
  headers: Record<string, any>;
  rawPayload: any;
  normalizedMessage?: any;
  reply?: string;
  channelOutput?: any;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  statusCode: number;
}

export const IntegrationHub: React.FC = () => {
  const [subTab, setSubTab] = useState<'snippets' | 'playground' | 'eventlogs' | 'auth'>('snippets');
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetKey>('widget');
  const [copied, setCopied] = useState<boolean>(false);

  // ------------------------------------
  // Interactive Playground State
  // ------------------------------------
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/v1/chat');
  const [testMethod, setTestMethod] = useState<string>('POST');
  const [testApiKey, setTestApiKey] = useState<string>('omni_live_admin_9841acb729e1');
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        message: 'Hello from the Interactive API Playground!',
        channel: 'rest-api',
        sessionId: 'test_playground_01',
        systemPrompt: 'You are an intelligent universal assistant.',
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);

  // ------------------------------------
  // Mock Auth Service State
  // ------------------------------------
  const [apiKeys, setApiKeys] = useState<MockKeyItem[]>([]);
  const [validateInputKey, setValidateInputKey] = useState<string>('omni_live_admin_9841acb729e1');
  const [validateScope, setValidateScope] = useState<string>('chat:write');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyTier, setNewKeyTier] = useState<'Developer' | 'Production' | 'Enterprise'>('Production');
  const [newKeyTenant, setNewKeyTenant] = useState<string>('Computer Science Dept');
  const [showNewKeyModal, setShowNewKeyModal] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // ------------------------------------
  // Webhook Event Log Viewer State
  // ------------------------------------
  const [webhookEvents, setWebhookEvents] = useState<WebhookLogItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookLogItem | null>(null);
  const [eventFilterChannel, setEventFilterChannel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState<boolean>(false);

  // Fetch API Keys & Webhook Events
  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/v1/auth/keys');
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setApiKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  };

  const fetchWebhookEvents = async () => {
    try {
      const res = await fetch('/api/v1/webhook-events');
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setWebhookEvents(data.events);
        if (!selectedEvent && data.events.length > 0) {
          setSelectedEvent(data.events[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load webhook events:', err);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchWebhookEvents();
  }, []);

  // Auto-refresh webhook events
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchWebhookEvents, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleCopy = () => {
    navigator.clipboard.writeText(INTEGRATION_SNIPPETS[selectedSnippet].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteApi = async () => {
    setIsCalling(true);
    setApiResponse(null);
    setApiStatus(null);
    const start = Date.now();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (testApiKey.trim()) {
        headers['X-Bot-Token'] = testApiKey.trim();
      }

      let options: RequestInit = {
        method: testMethod,
        headers,
      };

      if (testMethod === 'POST') {
        options.body = testPayload;
      }

      const res = await fetch(testEndpoint, options);
      const latency = Date.now() - start;
      const json = await res.json();

      setApiStatus(res.status);
      setApiLatency(latency);
      setApiResponse(json);

      // Refresh webhook events if testing webhooks
      if (testEndpoint.includes('webhook')) {
        setTimeout(fetchWebhookEvents, 300);
      }
    } catch (err: any) {
      setApiStatus(500);
      setApiResponse({ error: err.message });
      setApiLatency(Date.now() - start);
    } finally {
      setIsCalling(false);
    }
  };

  // Mock Auth Actions
  const handleValidateKey = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/v1/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: validateInputKey.trim(),
          requiredScope: validateScope,
        }),
      });

      const json = await res.json();
      setValidationResult({
        httpStatus: res.status,
        data: json,
      });
    } catch (err: any) {
      setValidationResult({
        httpStatus: 500,
        data: { valid: false, error: 'NETWORK_ERROR', message: err.message },
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/v1/auth/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          tier: newKeyTier,
          tenant: newKeyTenant.trim(),
          scopes: newKeyTier === 'Enterprise'
            ? ['chat:read', 'chat:write', 'webhook:receive', 'admin:manage']
            : ['chat:read', 'chat:write', 'webhook:receive'],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowNewKeyModal(false);
        setNewKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await fetch(`/api/v1/auth/keys/${id}`, { method: 'DELETE' });
      fetchKeys();
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleSimulateWebhook = async (channel: string) => {
    setIsSimulatingEvent(true);
    try {
      await fetch('/api/v1/webhook-events/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      await fetchWebhookEvents();
    } catch (err) {
      console.error('Failed to simulate webhook event:', err);
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  const handleClearWebhookLogs = async () => {
    try {
      await fetch('/api/v1/webhook-events', { method: 'DELETE' });
      setWebhookEvents([]);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to clear events:', err);
    }
  };

  const filteredWebhookEvents = webhookEvents.filter((ev) => {
    if (eventFilterChannel === 'all') return true;
    return ev.channel === eventFilterChannel;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1.5">
            <Layers className="w-4 h-4" />
            <span>INTEGRATION GATEWAY & DEVELOPER TOOLKIT</span>
          </div>
          <h2 className="text-xl font-bold text-white">System Integrations & API Hub</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Universal connectors, real-time webhook event debugger, mock authentication service, and drop-in SDK code for connecting any external client surface to OmniCore.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSubTab('snippets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              subTab === 'snippets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>SDK Snippets</span>
          </button>

          <button
            onClick={() => setSubTab('playground')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              subTab === 'playground'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Playground</span>
          </button>

          <button
            onClick={() => setSubTab('eventlogs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              subTab === 'eventlogs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="relative">
              Webhook Event Log
              {webhookEvents.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[10px] font-mono text-indigo-300">
                  {webhookEvents.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setSubTab('auth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              subTab === 'auth'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Mock Auth Service</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: SDK SNIPPETS */}
      {/* ---------------------------------------------------- */}
      {subTab === 'snippets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(INTEGRATION_SNIPPETS) as SnippetKey[]).map((key) => {
                const item = INTEGRATION_SNIPPETS[key];
                const isSelected = selectedSnippet === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSnippet(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.title.split('(')[0]}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white">{INTEGRATION_SNIPPETS[selectedSnippet].title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{INTEGRATION_SNIPPETS[selectedSnippet].desc}</p>
            </div>

            <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{INTEGRATION_SNIPPETS[selectedSnippet].lang.toUpperCase()}</span>
                <span>Universal Gateway v1</span>
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed">
                <code>{INTEGRATION_SNIPPETS[selectedSnippet].code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: INTERACTIVE API PLAYGROUND */}
      {/* ---------------------------------------------------- */}
      {subTab === 'playground' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Interactive REST API Explorer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send live HTTP requests against the OmniCore Express Gateway with optional API key authentication.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Presets:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: 'Universal Chat', method: 'POST', url: '/api/v1/chat', body: JSON.stringify({ message: 'Can you summarize project phase 1?', channel: 'rest-api', sessionId: 'sess_1' }, null, 2) },
                  { name: 'Health', method: 'GET', url: '/api/v1/health', body: '' },
                  { name: 'Integrations', method: 'GET', url: '/api/v1/integrations', body: '' },
                  { name: 'Slack Webhook', method: 'POST', url: '/api/v1/webhooks/slack', body: JSON.stringify({ type: 'event_callback', event: { type: 'app_mention', text: 'Exam schedule?', channel: 'C123' } }, null, 2) },
                  { name: 'Action Probe', method: 'POST', url: '/api/v1/test-connection', body: JSON.stringify({ adapter: 'web' }, null, 2) },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTestMethod(preset.method);
                      setTestEndpoint(preset.url);
                      setTestPayload(preset.body);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Config */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-indigo-400 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>

                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={handleExecuteApi}
                  disabled={isCalling}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isCalling ? 'Running...' : 'Send'}</span>
                </button>
              </div>

              {/* API Key Header field */}
              <div>
                <label className="text-[11px] text-slate-400 font-mono flex items-center justify-between mb-1">
                  <span>X-Bot-Token Header (Auth):</span>
                  <span className="text-[10px] text-indigo-400">Validated against mock auth service</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={testApiKey}
                    onChange={(e) => setTestApiKey(e.target.value)}
                    placeholder="omni_live_admin_..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    onChange={(e) => setTestApiKey(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-mono text-slate-400 focus:outline-none"
                  >
                    <option value="">Insert Key...</option>
                    {apiKeys.map((k) => (
                      <option key={k.id} value={k.key}>{k.name} ({k.tier})</option>
                    ))}
                  </select>
                </div>
              </div>

              {testMethod === 'POST' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">JSON Request Body:</label>
                  <textarea
                    rows={8}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Response Inspector */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 font-mono">Response Payload:</span>
                {apiStatus !== null && (
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      apiStatus >= 200 && apiStatus < 300
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      HTTP {apiStatus}
                    </span>
                    {apiLatency !== null && (
                      <span className="text-slate-400">{apiLatency}ms</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-[260px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-auto">
                {apiResponse ? (
                  <pre className="text-slate-300 text-[11px] leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                    Press "Send" to inspect live response payload.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: REAL-TIME WEBHOOK EVENT LOG VIEWER */}
      {/* ---------------------------------------------------- */}
      {subTab === 'eventlogs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Live Inbound Webhook Buffer</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400">
                  {webhookEvents.length} events
                </span>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Filter:</span>
                <select
                  value={eventFilterChannel}
                  onChange={(e) => setEventFilterChannel(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="all">All Channels</option>
                  <option value="slack">#slack</option>
                  <option value="discord">#discord</option>
                  <option value="custom-webhook">#custom-crm</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Simulate Inbound Webhook Dropdown */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSimulateWebhook('slack')}
                  disabled={isSimulatingEvent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition-colors"
                  title="Simulate incoming Slack app_mention webhook"
                >
                  <Hash className="w-3.5 h-3.5 text-[#E01E5A]" />
                  <span>+ Slack Event</span>
                </button>
                <button
                  onClick={() => handleSimulateWebhook('discord')}
                  disabled={isSimulatingEvent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition-colors"
                  title="Simulate incoming Discord slash command interaction"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>+ Discord Event</span>
                </button>
                <button
                  onClick={() => handleSimulateWebhook('custom-webhook')}
                  disabled={isSimulatingEvent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition-colors"
                  title="Simulate generic CRM ticket webhook"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ CRM Event</span>
                </button>
              </div>

              {/* Auto refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1 ${
                  autoRefresh
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle real-time 3s auto-polling"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>

              <button
                onClick={handleClearWebhookLogs}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
                title="Clear all event logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
            {/* Event List (Left 5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>INCOMING EVENT FEED</span>
                <span>{filteredWebhookEvents.length} Captured</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {filteredWebhookEvents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No webhook events recorded yet. Click "+ Slack Event" or send a POST request to `/api/v1/webhooks/:channel`.
                  </div>
                ) : (
                  filteredWebhookEvents.map((ev) => {
                    const isSelected = selectedEvent?.id === ev.id;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left p-3.5 transition-all flex flex-col space-y-1.5 ${
                          isSelected
                            ? 'bg-indigo-600/10 border-l-4 border-indigo-500 text-white'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              ev.channel === 'slack'
                                ? 'bg-[#4A154B]/80 text-white'
                                : ev.channel === 'discord'
                                ? 'bg-[#5865F2]/80 text-white'
                                : 'bg-amber-600/80 text-white'
                            }`}>
                              #{ev.channel}
                            </span>
                            <span className="text-xs font-mono font-medium truncate max-w-[140px]">
                              {ev.id}
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                            ev.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            {ev.statusCode}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 truncate">
                          {ev.normalizedMessage?.content || ev.reply || 'Webhook ping payload'}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                          <span>{ev.latencyMs}ms</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Event Payload Inspector (Right 7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Event Payload Debugger</span>
                  {selectedEvent && (
                    <span className="text-[11px] font-mono text-slate-400">
                      ({selectedEvent.id})
                    </span>
                  )}
                </div>

                {selectedEvent && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Event JSON</span>
                  </button>
                )}
              </div>

              {selectedEvent ? (
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40 text-xs font-mono">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Channel:</span>
                      <span className="text-indigo-400 font-bold">#{selectedEvent.channel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Roundtrip Latency:</span>
                      <span className="text-white">{selectedEvent.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ingestion Status:</span>
                      <span className={selectedEvent.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {selectedEvent.status} (HTTP {selectedEvent.statusCode})
                      </span>
                    </div>
                  </div>

                  {/* Normalized Universal Message */}
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                      1. Inbound Normalization (Canonical UniversalMessage):
                    </label>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto text-[11px]">
                      {JSON.stringify(selectedEvent.normalizedMessage, null, 2)}
                    </pre>
                  </div>

                  {/* Channel Egress Outbound */}
                  <div>
                    <label className="text-[11px] font-semibold text-indigo-400 block mb-1">
                      2. Formatted Channel Egress (Dispatched to #{selectedEvent.channel}):
                    </label>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto text-[11px]">
                      {JSON.stringify(selectedEvent.channelOutput, null, 2)}
                    </pre>
                  </div>

                  {/* Raw Inbound Payload */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      3. Raw Foreign Payload (As received from {selectedEvent.channel}):
                    </label>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 overflow-x-auto text-[11px]">
                      {JSON.stringify(selectedEvent.rawPayload, null, 2)}
                    </pre>
                  </div>

                  {/* Headers */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      4. Inbound Request Headers:
                    </label>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 overflow-x-auto text-[10px]">
                      {JSON.stringify(selectedEvent.headers, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Select an event on the left to inspect its normalization pipeline.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 4: MOCK AUTHENTICATION SERVICE */}
      {/* ---------------------------------------------------- */}
      {subTab === 'auth' && (
        <div className="space-y-6">
          {/* Top Info & New Key Trigger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>MOCK AUTHENTICATION & ACCESS CONTROL SERVICE</span>
              </div>
              <h3 className="text-lg font-bold text-white">API Key Authorization & Scope Simulator</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                Simulates real-world API key issuance, tenant scoping, rate limits, and cryptographic header verification (`X-Bot-Token` / `Bearer`).
              </p>
            </div>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20 shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New API Key</span>
            </button>
          </div>

          {/* Interactive Key Validation Tester */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Live API Key Validator Sandbox</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter any key or pick from the registry below to test permission validation, expiration checks, and scope enforcement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-6">
                <label className="text-[11px] text-slate-400 font-mono block mb-1">API Key to Verify:</label>
                <input
                  type="text"
                  value={validateInputKey}
                  onChange={(e) => setValidateInputKey(e.target.value)}
                  placeholder="omni_live_..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Required Scope Check:</label>
                <select
                  value={validateScope}
                  onChange={(e) => setValidateScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="chat:write">chat:write (Send message)</option>
                  <option value="chat:read">chat:read (Read context)</option>
                  <option value="webhook:receive">webhook:receive (Ingest event)</option>
                  <option value="admin:manage">admin:manage (Tenant admin)</option>
                  <option value="telemetry:read">telemetry:read (Metrics)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={handleValidateKey}
                  disabled={isValidating || !validateInputKey.trim()}
                  className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify Key</span>
                </button>
              </div>
            </div>

            {/* Validation Result Box */}
            {validationResult && (
              <div className={`p-4 rounded-xl border font-mono text-xs ${
                validationResult.data?.valid
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-current/20">
                  <div className="flex items-center space-x-2">
                    {validationResult.data?.valid ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      {validationResult.data?.valid ? 'KEY AUTHORIZED & VALID' : `ACCESS DENIED: ${validationResult.data?.error}`}
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-black/40">
                    HTTP {validationResult.httpStatus}
                  </span>
                </div>

                <div className="text-[11px] leading-relaxed">
                  {validationResult.data?.valid ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>Tenant: <strong>{validationResult.data.tenant}</strong></div>
                      <div>Tier: <strong>{validationResult.data.tier}</strong></div>
                      <div>Rate Limit: <strong>{validationResult.data.rateLimitPerMin} req/min</strong></div>
                      <div>Scopes: <strong>{validationResult.data.scopes?.join(', ')}</strong></div>
                    </div>
                  ) : (
                    <div>{validationResult.data?.message}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Key Registry Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Configured API Key Registry</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">{apiKeys.length} keys registered</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Key Name &amp; Tenant</th>
                    <th className="px-5 py-3">Token (Masked)</th>
                    <th className="px-5 py-3">Tier &amp; Limits</th>
                    <th className="px-5 py-3">Scopes</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{k.name}</div>
                        <div className="text-[10px] text-slate-400">{k.tenant}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">
                        <code>{k.keyMasked || k.key}</code>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-indigo-400 font-bold">{k.tier}</span>
                        <span className="text-[10px] text-slate-500 block">{k.rateLimitPerMin} req/min</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {k.scopes.map((s, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          k.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {k.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(k.key);
                            setCopiedKeyId(k.id);
                            setTimeout(() => setCopiedKeyId(null), 1500);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                          title="Copy full key token"
                        >
                          {copiedKeyId === k.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => {
                            setValidateInputKey(k.key);
                            handleValidateKey();
                          }}
                          className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[10px]"
                          title="Test verification"
                        >
                          Test
                        </button>
                        {k.status === 'active' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[10px]"
                            title="Revoke key"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Key Modal */}
          {showNewKeyModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-base font-bold text-white mb-2">Issue New Integration API Key</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Generates an authorized client token with configurable rate-limits and scopes.
                </p>

                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Key Name / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Student Mobile App Gateway"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Tenant / Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. School of Computing"
                      value={newKeyTenant}
                      onChange={(e) => setNewKeyTenant(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Access Tier</label>
                    <select
                      value={newKeyTier}
                      onChange={(e) => setNewKeyTier(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Developer">Developer (60 req/min)</option>
                      <option value="Production">Production (120 req/min)</option>
                      <option value="Enterprise">Enterprise (500 req/min + Admin)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowNewKeyModal(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
