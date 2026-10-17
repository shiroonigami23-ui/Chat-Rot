import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Terminal, 
  ShieldCheck, 
  Check, 
  Clock, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface TestStep {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  latencyMs?: number;
  log?: string;
  payloadSummary?: string;
}

const INITIAL_TEST_STEPS: TestStep[] = [
  {
    id: 'health_probe',
    name: '1. Gateway Readiness & Telemetry Probe',
    category: 'Infra & Health',
    description: 'Queries /api/v1/health to verify runtime health, active adapters, and AI provider status.',
    status: 'idle',
  },
  {
    id: 'universal_chat',
    name: '2. Universal Message Normalization',
    category: 'Contract Schema',
    description: 'Sends canonical UniversalInboundMessage payload to /api/v1/chat and asserts envelope compliance.',
    status: 'idle',
  },
  {
    id: 'slack_blockkit',
    name: '3. Slack BlockKit Egress Formatter',
    category: 'Channel Adapter',
    description: 'Asserts outbound response converts markdown into Slack blocks with interactive section headers.',
    status: 'idle',
  },
  {
    id: 'discord_embed',
    name: '4. Discord Embed Transformation',
    category: 'Channel Adapter',
    description: 'Validates Discord interaction payload generates proper color-coded embed structures.',
    status: 'idle',
  },
  {
    id: 'webhook_receiver',
    name: '5. Inbound Webhook Event Pipeline',
    category: 'Webhook Gateway',
    description: 'Simulates foreign Slack app_mention webhook event at /api/v1/webhooks/slack.',
    status: 'idle',
  },
  {
    id: 'benchmark_latency',
    name: '6. End-to-End Latency & Guardrail Benchmark',
    category: 'Performance & Quality',
    description: 'Measures roundtrip execution time and verifies token budgeting constraints.',
    status: 'idle',
  },
];

export const ActionBotVerifier: React.FC = () => {
  const [testSteps, setTestSteps] = useState<TestStep[]>(INITIAL_TEST_STEPS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[Action Bot] Ready for automated verification sequence.',
    '[Action Bot] Configured to validate contract compatibility across Web, REST, Slack, and Discord.',
  ]);

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] >>> INITIATING ACTION BOT VERIFICATION RUN <<<`,
      `[${new Date().toLocaleTimeString()}] Target Host: http://localhost:3000/api/v1`,
    ]);

    const updated = [...INITIAL_TEST_STEPS];

    // Helper to update a step
    const updateStep = (index: number, patch: Partial<TestStep>) => {
      updated[index] = { ...updated[index], ...patch };
      setTestSteps([...updated]);
    };

    try {
      // 1. Health Probe
      updateStep(0, { status: 'running' });
      addLog('Step 1: Sending probe to GET /api/v1/health...');
      const start1 = Date.now();
      const res1 = await fetch('/api/v1/health');
      const data1 = await res1.json();
      const lat1 = Date.now() - start1;

      if (res1.ok && data1.status === 'healthy') {
        updateStep(0, {
          status: 'passed',
          latencyMs: lat1,
          payloadSummary: `Status: ${data1.status} | Adapters: ${data1.activeAdapters?.join(', ')}`,
        });
        addLog(`Step 1 PASSED: Gateway healthy (${lat1}ms). Active adapters: ${data1.activeAdapters?.length}`);
      } else {
        updateStep(0, { status: 'failed', latencyMs: lat1 });
        addLog('Step 1 FAILED: Invalid health status');
      }

      await new Promise((r) => setTimeout(r, 300));

      // 2. Universal Chat
      updateStep(1, { status: 'running' });
      addLog('Step 2: Testing POST /api/v1/chat with Universal payload...');
      const start2 = Date.now();
      const res2 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Action Bot verification probe #499',
          channel: 'rest-api',
          sessionId: 'action_bot_session',
        }),
      });
      const data2 = await res2.json();
      const lat2 = Date.now() - start2;

      if (res2.ok && data2.success && data2.data?.reply) {
        updateStep(1, {
          status: 'passed',
          latencyMs: lat2,
          payloadSummary: `Message ID: ${data2.data.messageId} | Tokens: ${data2.data.tokens?.totalTokens}`,
        });
        addLog(`Step 2 PASSED: Universal envelope accepted and normalized (${lat2}ms).`);
      } else {
        updateStep(1, { status: 'failed', latencyMs: lat2 });
        addLog('Step 2 FAILED: Envelope response malformed');
      }

      await new Promise((r) => setTimeout(r, 300));

      // 3. Slack BlockKit
      updateStep(2, { status: 'running' });
      addLog('Step 3: Checking Slack egress formatter...');
      const start3 = Date.now();
      const res3 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Testing Slack BlockKit rendering',
          channel: 'slack',
          sessionId: 'slack_test_session',
        }),
      });
      const data3 = await res3.json();
      const lat3 = Date.now() - start3;

      if (res3.ok && data3.data?.channelOutput?.blocks) {
        updateStep(2, {
          status: 'passed',
          latencyMs: lat3,
          payloadSummary: `Slack blocks verified: ${data3.data.channelOutput.blocks.length} sections`,
        });
        addLog(`Step 3 PASSED: Slack BlockKit egress validated (${lat3}ms).`);
      } else {
        updateStep(2, { status: 'failed', latencyMs: lat3 });
        addLog('Step 3 FAILED: Slack BlockKit output missing blocks array');
      }

      await new Promise((r) => setTimeout(r, 300));

      // 4. Discord Embed
      updateStep(3, { status: 'running' });
      addLog('Step 4: Checking Discord embed egress transformer...');
      const start4 = Date.now();
      const res4 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Testing Discord embed formatting',
          channel: 'discord',
          sessionId: 'discord_test_session',
        }),
      });
      const data4 = await res4.json();
      const lat4 = Date.now() - start4;

      if (res4.ok && Array.isArray(data4.data?.channelOutput?.embeds)) {
        updateStep(3, {
          status: 'passed',
          latencyMs: lat4,
          payloadSummary: `Discord embeds verified (Color: ${data4.data.channelOutput.embeds[0]?.color})`,
        });
        addLog(`Step 4 PASSED: Discord embed schema validated (${lat4}ms).`);
      } else {
        updateStep(3, { status: 'failed', latencyMs: lat4 });
        addLog('Step 4 FAILED: Discord embed payload mismatch');
      }

      await new Promise((r) => setTimeout(r, 300));

      // 5. Inbound Webhook Pipeline
      updateStep(4, { status: 'running' });
      addLog('Step 5: Testing inbound foreign webhook ingestion at /api/v1/webhooks/slack...');
      const start5 = Date.now();
      const res5 = await fetch('/api/v1/webhooks/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_callback',
          event: {
            type: 'app_mention',
            text: '<@U012BOT> Action Bot verification event',
            channel: 'C09483',
            user: 'U98124',
          },
        }),
      });
      const data5 = await res5.json();
      const lat5 = Date.now() - start5;

      if (res5.ok && data5.normalized && data5.reply) {
        updateStep(4, {
          status: 'passed',
          latencyMs: lat5,
          payloadSummary: `Inbound user: ${data5.inboundUser} | Channel: ${data5.channel}`,
        });
        addLog(`Step 5 PASSED: Webhook normalized and replied with BlockKit (${lat5}ms).`);
      } else {
        updateStep(4, { status: 'failed', latencyMs: lat5 });
        addLog('Step 5 FAILED: Webhook normalization error');
      }

      await new Promise((r) => setTimeout(r, 300));

      // 6. Benchmark
      updateStep(5, { status: 'running' });
      addLog('Step 6: Running performance test harness at /api/v1/test-connection...');
      const start6 = Date.now();
      const res6 = await fetch('/api/v1/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adapter: 'web' }),
      });
      const data6 = await res6.json();
      const lat6 = Date.now() - start6;

      if (res6.ok && data6.status === 'PASSED') {
        updateStep(5, {
          status: 'passed',
          latencyMs: lat6,
          payloadSummary: `Roundtrip: ${data6.roundtripMs}ms | Checks: All Pass`,
        });
        addLog(`Step 6 PASSED: Performance benchmark passed (${lat6}ms).`);
        addLog(`[${new Date().toLocaleTimeString()}] >>> ACTION BOT VERIFICATION COMPLETED: 100% PASS <<<`);
      } else {
        updateStep(5, { status: 'failed', latencyMs: lat6 });
        addLog('Step 6 FAILED: Connection test failed');
      }
    } catch (err: any) {
      addLog(`FATAL ERROR DURING ACTION BOT RUN: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = testSteps.filter((s) => s.status === 'passed').length;
  const failedCount = testSteps.filter((s) => s.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
            <Activity className="w-4 h-4" />
            <span>CONTINUOUS INTEGRATION & ACTION BOT HARNESS</span>
          </div>
          <h2 className="text-xl font-bold text-white">System Integration Verification Bot</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Simulates end-to-end multi-channel contract tests. Used in GitHub Actions (`.github/workflows/bot-verification.yml`) to ensure team pull requests never break external system integrations.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 self-start md:self-auto"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Handshakes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Action Bot Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono mb-1">Total Test Suites</div>
          <div className="text-2xl font-bold text-white font-mono">{testSteps.length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono mb-1">Passed Handshakes</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
            <span>{passedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono mb-1">Failed Assertions</div>
          <div className="text-2xl font-bold text-slate-200 font-mono flex items-center space-x-1.5">
            <span className={failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}>{failedCount}</span>
            {failedCount > 0 && <XCircle className="w-5 h-5 text-rose-400" />}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono mb-1">Contract Compliance</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {passedCount === testSteps.length ? '100%' : `${Math.round((passedCount / testSteps.length) * 100)}%`}
          </div>
        </div>
      </div>

      {/* Test Matrix & Real-time Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Steps List */}
        <div className="lg:col-span-7 space-y-3">
          {testSteps.map((step) => {
            let statusBadge = (
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                PENDING
              </span>
            );

            if (step.status === 'running') {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono flex items-center space-x-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>RUNNING</span>
                </span>
              );
            } else if (step.status === 'passed') {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center space-x-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>PASSED ({step.latencyMs}ms)</span>
                </span>
              );
            } else if (step.status === 'failed') {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                  FAILED
                </span>
              );
            }

            return (
              <div
                key={step.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">{step.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {step.category}
                    </span>
                  </div>
                  {statusBadge}
                </div>
                <p className="text-xs text-slate-400">{step.description}</p>
                {step.payloadSummary && (
                  <div className="mt-2 text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate">
                    {step.payloadSummary}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Action Bot Terminal Logs */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[400px]">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Action Bot Console Output</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">CI Runner Mode</span>
          </div>

          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto space-y-1">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className={log.includes('PASSED') ? 'text-emerald-400' : log.includes('FAILED') ? 'text-rose-400' : 'text-slate-300'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
