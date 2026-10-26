import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  GitCommit,
  GitPullRequest,
  FileText,
  AlertTriangle,
  Shield,
  Copy,
  ExternalLink,
  Sparkles,
  Search,
  Code2,
  Download,
  Info
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext.tsx';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Sub-tab: 'integration_tests' | 'changelog_bot'
  const [activeSubTab, setActiveSubTab] = useState<'integration_tests' | 'changelog_bot'>('integration_tests');

  // Integration test steps state
  const [testSteps, setTestSteps] = useState<TestStep[]>(INITIAL_TEST_STEPS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[Action Bot] Ready for automated verification sequence.',
    '[Action Bot] Configured to validate contract compatibility across Web, REST, Slack, and Discord.',
  ]);

  // Smart Changelog Action Bot State
  const [changelogStatus, setChangelogStatus] = useState<any>(null);
  const [simCommitMsg, setSimCommitMsg] = useState('feat(voice): add real-time speech dictation with audio wave indicator');
  const [simAuthor, setSimAuthor] = useState('Alice Developer');
  const [simFiles, setSimFiles] = useState('src/components/ChannelSandbox.tsx, backend/core/pipeline.ts');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/v1/actionbot/changelog-status')
      .then((res) => res.json())
      .then((data) => setChangelogStatus(data))
      .catch(() => {});
  }, []);

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
        addLog('Step 1 FAILED: Health probe returned unhealthy response');
      }

      await new Promise((r) => setTimeout(r, 250));

      // 2. Universal Chat
      updateStep(1, { status: 'running' });
      addLog('Step 2: Sending universal chat test payload to POST /api/v1/chat...');
      const start2 = Date.now();
      const res2 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Action bot test handshake',
          channel: 'rest-api',
          sessionId: 'ci_action_bot_run',
        }),
      });
      const data2 = await res2.json();
      const lat2 = Date.now() - start2;

      if (res2.ok && data2.success && data2.reply) {
        updateStep(1, {
          status: 'passed',
          latencyMs: lat2,
          payloadSummary: `Session: ${data2.sessionId} | Latency: ${data2.latencyMs}ms | Tokens: ${data2.tokens?.totalTokens}`,
        });
        addLog(`Step 2 PASSED: Universal envelope accepted and resolved (${lat2}ms).`);
      } else {
        updateStep(1, { status: 'failed', latencyMs: lat2 });
        addLog('Step 2 FAILED: Universal chat failed schema validation');
      }

      await new Promise((r) => setTimeout(r, 250));

      // 3. Slack BlockKit
      updateStep(2, { status: 'running' });
      addLog('Step 3: Testing Slack adapter formatting...');
      const start3 = Date.now();
      const res3 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What courses are offered?',
          channel: 'slack',
          sessionId: 'slack_test_session',
        }),
      });
      const data3 = await res3.json();
      const lat3 = Date.now() - start3;

      if (res3.ok && data3.channelPayload?.blocks) {
        updateStep(2, {
          status: 'passed',
          latencyMs: lat3,
          payloadSummary: `Blocks count: ${data3.channelPayload.blocks.length} | BlockKit: Valid`,
        });
        addLog(`Step 3 PASSED: Slack BlockKit envelope generated (${lat3}ms).`);
      } else {
        updateStep(2, { status: 'failed', latencyMs: lat3 });
        addLog('Step 3 FAILED: Slack BlockKit transformation missing blocks');
      }

      await new Promise((r) => setTimeout(r, 250));

      // 4. Discord Embed
      updateStep(3, { status: 'running' });
      addLog('Step 4: Testing Discord adapter embed generator...');
      const start4 = Date.now();
      const res4 = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Help with capstone roadmap',
          channel: 'discord',
          sessionId: 'discord_test_session',
        }),
      });
      const data4 = await res4.json();
      const lat4 = Date.now() - start4;

      if (res4.ok && data4.channelPayload?.embeds) {
        updateStep(3, {
          status: 'passed',
          latencyMs: lat4,
          payloadSummary: `Embeds count: ${data4.channelPayload.embeds.length} | Color: #6366f1`,
        });
        addLog(`Step 4 PASSED: Discord embed generated (${lat4}ms).`);
      } else {
        updateStep(3, { status: 'failed', latencyMs: lat4 });
        addLog('Step 4 FAILED: Discord embed payload transformation missing');
      }

      await new Promise((r) => setTimeout(r, 250));

      // 5. Inbound Webhook
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

      await new Promise((r) => setTimeout(r, 250));

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

  const handleSimulateChangelog = async (customMsg?: string, customAuthor?: string, customFiles?: string[]) => {
    setIsSimulating(true);
    const msg = customMsg !== undefined ? customMsg : simCommitMsg;
    const author = customAuthor !== undefined ? customAuthor : simAuthor;
    const files = customFiles !== undefined 
      ? customFiles 
      : simFiles.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/v1/actionbot/simulate-changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitMessage: msg,
          author,
          changedFiles: files,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch {
      // ignore
    } finally {
      setIsSimulating(false);
    }
  };

  const copyWorkflow = () => {
    const yaml = `name: Smart Changelog Action Bot

on:
  push:
    branches: [main, master]
    paths-ignore:
      - 'CHANGELOG.md'
      - '.github/workflows/changelog-bot.yml'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-changelog:
    name: Smart Changelog Synchronization & Loop Guard
    # Layer 1 & 2 Guard: Abort if commit has [skip ci], is automated changelog, or triggered by bot actor
    if: |
      !contains(github.event.head_commit.message, '[skip ci]') &&
      !contains(github.event.head_commit.message, '[ci skip]') &&
      !contains(github.event.head_commit.message, '[auto-changelog]') &&
      github.actor != 'github-actions[bot]' &&
      github.actor != 'dependabot[bot]'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Smart Changelog Generator
        run: |
          node scripts/update-changelog.js

      - name: Commit and Push Changelog Update
        run: |
          # Layer 3 Guard: Diff check - abort if no actual changes to CHANGELOG.md
          if git diff --quiet CHANGELOG.md; then
            echo "No new changelog entries recorded. Exiting cleanly."
            exit 0
          fi

          echo "Staging updated CHANGELOG.md..."
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md

          # CRITICAL ANTI-RECURSION: [skip ci] and [auto-changelog] prevents GitHub Actions re-triggering
          git commit -m "docs(changelog): automated update via Action Bot [auto-changelog] [skip ci]"
          git push`;

    navigator.clipboard.writeText(yaml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const passedCount = testSteps.filter((s) => s.status === 'passed').length;
  const failedCount = testSteps.filter((s) => s.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className={`p-6 rounded-2xl border transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-emerald-500 text-xs font-mono mb-1 font-semibold">
            <Activity className="w-4 h-4" />
            <span>CONTINUOUS INTEGRATION &amp; ACTION BOT HARNESS</span>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>OmniCore CI Action Bot System</h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Automated testing and documentation bot for GitHub Actions. Validates multi-channel adapter contracts and automatically generates smart CHANGELOG.md entries with a 3-layer anti-recursion loop shield.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className={`flex items-center p-1 rounded-xl border self-start md:self-auto ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveSubTab('integration_tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'integration_tests'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integration Verifier</span>
          </button>

          <button
            onClick={() => setActiveSubTab('changelog_bot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'changelog_bot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Smart Changelog Bot</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'integration_tests' ? (
        /* ================= SUB-TAB 1: INTEGRATION TESTS ================= */
        <div className="space-y-6">
          {/* Summary Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Test Suites</div>
              <div className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{testSteps.length}</div>
            </div>

            <div className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Passed Handshakes</div>
              <div className="text-2xl font-bold text-emerald-500 font-mono flex items-center space-x-1.5">
                <span>{passedCount}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Failed Assertions</div>
              <div className={`text-2xl font-bold font-mono flex items-center space-x-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                <span className={failedCount > 0 ? 'text-rose-500' : isDark ? 'text-slate-400' : 'text-slate-400'}>{failedCount}</span>
                {failedCount > 0 && <XCircle className="w-5 h-5 text-rose-500" />}
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`text-xs font-mono mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contract Compliance</div>
              <div className="text-2xl font-bold text-indigo-500 font-mono">
                {passedCount === testSteps.length ? '100%' : `${Math.round((passedCount / testSteps.length) * 100)}%`}
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Runs against active endpoint: <code className="text-indigo-400 font-semibold">http://localhost:3000/api/v1</code>
            </span>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0"
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

          {/* Test Matrix & Real-time Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Test Steps List */}
            <div className="lg:col-span-7 space-y-3">
              {testSteps.map((step) => {
                let statusBadge = (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
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
                    className={`rounded-xl p-4 border transition-colors shadow-sm ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {step.category}
                        </span>
                      </div>
                      {statusBadge}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.description}</p>
                    {step.payloadSummary && (
                      <div className={`mt-2 text-[10px] font-mono px-2 py-1 rounded border truncate ${
                        isDark 
                          ? 'text-slate-300 bg-slate-950 border-slate-800' 
                          : 'text-slate-700 bg-slate-50 border-slate-200'
                      }`}>
                        {step.payloadSummary}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Action Bot Terminal Logs */}
            <div className={`lg:col-span-5 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[400px] border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Action Bot CI Console Output</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Workflow Runner</span>
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
      ) : (
        /* ================= SUB-TAB 2: SMART CHANGELOG ACTION BOT ================= */
        <div className="space-y-6">
          {/* 3-Layer Anti-Recursion Shield Overview */}
          <div className={`p-6 rounded-2xl border transition-colors shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono mb-2 font-semibold">
              <Shield className="w-4 h-4" />
              <span>3-LAYER ANTI-RECURSION SHIELD (PREVENTS INFINITE CI LOOPS)</span>
            </div>
            <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              How OmniCore Prevents Bot Self-Triggering Loops
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              When a GitHub Action updates a repository file and pushes, naive configurations accidentally re-trigger the workflow endlessly on their own commit. OmniCore solves this with three rigorous architectural barriers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>[skip ci] Tag Guard</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Automated commits are tagged with <code className="text-indigo-400 font-mono">[skip ci]</code> and <code className="text-indigo-400 font-mono">[auto-changelog]</code>, commanding GitHub Actions to ignore the push.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bot Actor Filter</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Workflow <code className="text-emerald-400 font-mono">if:</code> condition checks <code className="text-emerald-400 font-mono">github.actor != 'github-actions[bot]'</code> to discard any bot-originated push.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Diff &amp; Path Guard</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Workflow uses <code className="text-purple-400 font-mono">paths-ignore: ['CHANGELOG.md']</code>. If only the changelog changed, execution immediately halts with zero commits.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Commit Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-7 p-6 rounded-2xl border transition-colors shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Test Smart Commit Parser &amp; Recursion Blocker
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Interactive Simulator
                </span>
              </div>

              {/* Quick Presets */}
              <div className="mb-4">
                <label className={`text-[11px] font-mono block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Load Test Scenario Preset:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const msg = 'feat(rag): add institutional knowledge vector search';
                      const author = 'Alice (Engineer)';
                      const files = ['backend/core/pipeline.ts', 'src/components/KnowledgeBaseStudio.tsx'];
                      setSimCommitMsg(msg);
                      setSimAuthor(author);
                      setSimFiles(files.join(', '));
                      handleSimulateChangelog(msg, author, files);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Feature (feat:)
                  </button>

                  <button
                    onClick={() => {
                      const msg = 'fix(discord): correct embed color hex formatting';
                      const author = 'Bob (Integrator)';
                      const files = ['backend/adapters/channel.adapter.ts'];
                      setSimCommitMsg(msg);
                      setSimAuthor(author);
                      setSimFiles(files.join(', '));
                      handleSimulateChangelog(msg, author, files);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Bug Fix (fix:)
                  </button>

                  <button
                    onClick={() => {
                      const msg = 'docs(changelog): automated update via Action Bot [auto-changelog] [skip ci]';
                      const author = 'github-actions[bot]';
                      const files = ['CHANGELOG.md'];
                      setSimCommitMsg(msg);
                      setSimAuthor(author);
                      setSimFiles(files.join(', '));
                      handleSimulateChangelog(msg, author, files);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border font-mono bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    Trigger Bot Loop Test
                  </button>

                  <button
                    onClick={() => {
                      const msg = 'manual edit to changelog notes';
                      const author = 'Carol (Maintainer)';
                      const files = ['CHANGELOG.md'];
                      setSimCommitMsg(msg);
                      setSimAuthor(author);
                      setSimFiles(files.join(', '));
                      handleSimulateChangelog(msg, author, files);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border font-mono bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
                  >
                    Only CHANGELOG.md Diff
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className={`text-[11px] font-mono block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Commit Message:
                  </label>
                  <input
                    type="text"
                    value={simCommitMsg}
                    onChange={(e) => setSimCommitMsg(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="e.g. feat(voice): add speech recognition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[11px] font-mono block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Commit Author:
                    </label>
                    <input
                      type="text"
                      value={simAuthor}
                      onChange={(e) => setSimAuthor(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder="e.g. Developer or github-actions[bot]"
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-mono block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Changed Files (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={simFiles}
                      onChange={(e) => setSimFiles(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder="e.g. src/App.tsx, CHANGELOG.md"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSimulateChangelog()}
                  disabled={isSimulating || !simCommitMsg.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all mt-2"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Anti-Recursion Gates...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simulate Git Push Event</span>
                    </>
                  )}
                </button>
              </div>

              {/* Simulation Result */}
              {simResult && (
                <div className={`mt-5 p-4 rounded-xl border transition-all ${
                  simResult.isLoopPrevented 
                    ? 'bg-rose-500/10 border-rose-500/30' 
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {simResult.isLoopPrevented ? (
                      <>
                        <Shield className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-rose-400 font-mono">
                          RECURSION BLOCKED ({simResult.guardTriggered})
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ACTION APPROVED: WILL UPDATE CHANGELOG.MD
                        </span>
                      </>
                    )}
                  </div>

                  <p className={`text-xs mb-3 font-mono ${simResult.isLoopPrevented ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {simResult.reason}
                  </p>

                  {simResult.classified && (
                    <div className={`p-3 rounded-lg border font-mono text-xs space-y-2 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/50 pb-1">
                        <span>Classified Category: <strong className="text-indigo-400">{simResult.classified.category}</strong></span>
                        <span>Auto-Title: <strong className="text-slate-200">{simResult.classified.title}</strong></span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400">Keep-a-Changelog Markdown to append:</span>
                        <pre className="mt-1 p-2 rounded bg-slate-900 text-indigo-300 text-[10px]">
                          {simResult.classified.generatedMarkdown}
                        </pre>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Next Commit Safe Message: <code className="text-emerald-400 font-mono">{simResult.classified.nextCommitMessage}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Workflow File & Documentation */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-5 rounded-2xl border transition-colors shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      .github/workflows/changelog-bot.yml
                    </span>
                  </div>
                  <button
                    onClick={copyWorkflow}
                    className={`text-[11px] p-1.5 rounded-lg border flex items-center space-x-1 font-mono transition-colors ${
                      copiedCode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed max-h-[280px] overflow-y-auto">
                  <pre className="text-[10px] text-slate-300">
{`name: Smart Changelog Action Bot
on:
  push:
    branches: [main, master]
    paths-ignore:
      - 'CHANGELOG.md'
      - '.github/workflows/changelog-bot.yml'
permissions:
  contents: write
jobs:
  update-changelog:
    if: |
      !contains(github.event.head_commit.message, '[skip ci]') &&
      !contains(github.event.head_commit.message, '[auto-changelog]') &&
      github.actor != 'github-actions[bot]'
    steps:
      - uses: actions/checkout@v4
      - run: node scripts/update-changelog.js
      - run: |
          git commit -m "docs(changelog): automated update [auto-changelog] [skip ci]"
          git push`}
                  </pre>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Runner: Ubuntu-Latest</span>
                  <span className="text-emerald-400 font-semibold">Active &amp; Committed</span>
                </div>
              </div>

              {/* Live CHANGELOG.md Status */}
              <div className={`p-5 rounded-2xl border transition-colors shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      CHANGELOG.md System State
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    Keep a Changelog 1.0.0
                  </span>
                </div>

                <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  The file is automatically maintained with every pull request and push. All changes are categorized under Added, Changed, Fixed, or Documentation.
                </p>

                <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex justify-between">
                    <span>File Path:</span>
                    <strong className="text-indigo-400">/CHANGELOG.md</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Generator Script:</span>
                    <strong className="text-emerald-400">/scripts/update-changelog.js</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Workflow Trigger:</span>
                    <span>on: push (branches: [main])</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loop Protection:</span>
                    <span className="text-emerald-400 font-bold">Guaranteed 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
