import React, { useState } from 'react';
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
  BookOpen
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
bot = OmniCoreClient()
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
const bot = new OmniCoreSDK();
const { data } = await bot.chat('Check system integration readiness');
console.log(data.reply);`,
  },
  reactHook: {
    title: 'React Custom Hook (useOmniBot.ts)',
    lang: 'typescript',
    desc: 'Ready-to-use React hook with state handling for SPA frontends.',
    code: `import { useState, useCallback } from 'react';

export function useOmniBot(apiBase = '/api/v1') {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch(\`\${apiBase}/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, channel: 'web' })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.data.reply }]);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  return { messages, sendMessage, loading };
}`,
  },
  curl: {
    title: 'Direct cURL Command',
    lang: 'bash',
    desc: 'Test the universal endpoint directly from your terminal.',
    code: `curl -X POST http://localhost:3000/api/v1/chat \\
  -H "Content-Type: application/json" \\
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

export const IntegrationHub: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetKey>('widget');
  const [copied, setCopied] = useState<boolean>(false);

  // Interactive Playground State
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/v1/chat');
  const [testMethod, setTestMethod] = useState<string>('POST');
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
      let options: RequestInit = {
        method: testMethod,
        headers: { 'Content-Type': 'application/json' },
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
    } catch (err: any) {
      setApiStatus(500);
      setApiResponse({ error: err.message });
      setApiLatency(Date.now() - start);
    } finally {
      setIsCalling(false);
    }
  };

  const presetEndpoints = [
    {
      name: 'Universal Chat',
      method: 'POST',
      url: '/api/v1/chat',
      body: JSON.stringify({ message: 'Can you summarize project phase 1?', channel: 'rest-api', sessionId: 'sess_1' }, null, 2),
    },
    {
      name: 'System Health',
      method: 'GET',
      url: '/api/v1/health',
      body: '',
    },
    {
      name: 'Channel Integrations',
      method: 'GET',
      url: '/api/v1/integrations',
      body: '',
    },
    {
      name: 'Slack Inbound Webhook',
      method: 'POST',
      url: '/api/v1/webhooks/slack',
      body: JSON.stringify({ type: 'event_callback', event: { type: 'app_mention', text: 'Exam schedule?', channel: 'C123' } }, null, 2),
    },
    {
      name: 'Action Bot Probe',
      method: 'POST',
      url: '/api/v1/test-connection',
      body: JSON.stringify({ adapter: 'web' }, null, 2),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-2">
            <Layers className="w-4 h-4" />
            <span>UNIVERSAL SYSTEM INTEGRATION LAYER</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connect OmniCore to Any Environment</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            OmniCore’s architecture decouples conversational logic from client presentation. Use our ready-made snippets below to embed the bot in web apps, consume it via backend APIs, or route incoming Slack/Discord events.
          </p>
        </div>
      </div>

      {/* Code Snippet Tabs */}
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

      {/* Interactive REST API Playground */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span>Interactive REST API Playground</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute live HTTP requests against the OmniCore Express Gateway running on port 3000.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Presets:</span>
            <div className="flex flex-wrap gap-1">
              {presetEndpoints.map((preset, idx) => (
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
                <span>{isCalling ? 'Executing...' : 'Run Request'}</span>
              </button>
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

            <div className="flex-1 min-h-[200px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-auto">
              {apiResponse ? (
                <pre className="text-slate-300 text-[11px] leading-relaxed">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Press "Run Request" to inspect live response payload.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
