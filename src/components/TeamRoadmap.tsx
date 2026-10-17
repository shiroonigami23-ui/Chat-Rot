import React from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  GitPullRequest, 
  ShieldCheck, 
  Terminal, 
  FolderTree, 
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext.tsx';

const TEAM_MEMBERS = [
  {
    role: 'Student 1 (Core Pipeline & AI Engine)',
    title: 'Lead Architect',
    focus: 'LLM Orchestration, System Directives, Token Budgeting, Session Window',
    deliverables: [
      'Server-side Gemini 3.8 Flash SDK integration with User-Agent telemetry',
      'Universal message normalizer converting raw inputs to canonical schema',
      'Deterministic fallback simulation for offline/test environments',
      'Multi-turn context window maintenance and token estimation logic'
    ],
    status: 'Phase 1 Complete'
  },
  {
    role: 'Student 2 (Channel Adapters & Webhook Gateway)',
    title: 'Integration Specialist',
    focus: 'Slack/Discord Adapters, Inbound Normalization, Python/Node SDKs',
    deliverables: [
      'Slack BlockKit output transformer and URL verification challenge handler',
      'Discord interaction webhook parser and rich embed response formatter',
      'REST API schema definition and contract documentation in OpenAPI format',
      'Copyable Python, Node.js, and cURL integration snippets'
    ],
    status: 'Phase 1 Complete'
  },
  {
    role: 'Student 3 (Developer Studio & CI/CD Verification)',
    title: 'Frontend & DevOps Lead',
    focus: 'Interactive Sandbox, Action Bot Test Harness, GitHub Workflows',
    deliverables: [
      'React Developer Portal with live multi-channel simulator and payload inspector',
      'Automated Action Bot test suite asserting contract compatibility',
      '.github/workflows/ci.yml and bot-verification.yml pipeline configs',
      'Complete repository documentation suite (README, CONTRIBUTING, CHANGELOG, ARCHITECTURE)'
    ],
    status: 'Phase 1 Complete'
  }
];

const PHASES = [
  {
    number: 'Phase 1',
    name: 'Foundation & Universal Gateway',
    weeks: 'Weeks 1 - 2',
    badge: 'Completed & Active',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    current: true,
    goals: [
      'Establish Express API Gateway with universal normalization layer on /api/v1/chat',
      'Implement multi-channel adapters (Web, REST, Slack, Discord, Custom Webhooks)',
      'Deploy Gemini 3.8 Flash server integration with deterministic simulation fallback',
      'Create team documentation, contributing guidelines, and CI action bot workflows',
      'Build developer studio interface for channel simulation and payload inspection'
    ]
  },
  {
    number: 'Phase 2',
    name: 'Adapter Hardening & Real Webhook Integration',
    weeks: 'Weeks 3 - 4',
    badge: 'Upcoming Sprint',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    current: false,
    goals: [
      'Connect live Slack App OAuth and Socket Mode gateway daemon',
      'Register Discord application slash commands (/ask, /advisor, /help)',
      'Add persistent Redis/PostgreSQL session storage for multi-server scaling',
      'Implement token bucket rate-limiting and cryptographic API key hashing'
    ]
  },
  {
    number: 'Phase 3',
    name: 'Knowledge Base / RAG & Tool Invocations',
    weeks: 'Weeks 5 - 6',
    badge: 'Planned',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    current: false,
    goals: [
      'Build document ingestion pipeline for University CS course catalogs and PDFs',
      'Implement semantic search using Gemini Embeddings and local vector cache',
      'Integrate function calling tools (query exam dates, check lab seat availability)',
      'Harden guardrails against prompt injection and jailbreak attempts'
    ]
  },
  {
    number: 'Phase 4',
    name: 'Benchmarking, Evaluation & Capstone Defense',
    weeks: 'Weeks 7 - 8',
    badge: 'Final Sprint',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    current: false,
    goals: [
      'Conduct stress-testing harness with 50 concurrent channel requests',
      'Generate quantitative evaluation report (latency curves, token efficiency, BLEU/ROUGE)',
      'Produce capstone demonstration video, presentation slides, and technical report',
      'Publish tagged v1.0.0 release to university GitHub repository'
    ]
  }
];

export const TeamRoadmap: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className={`p-6 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono mb-2 font-semibold">
          <Calendar className="w-4 h-4" />
          <span>CAPSTONE 2-MONTH EXECUTION PLAN</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Coordination &amp; Milestones</h2>
        <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Designed for a team of 3 students collaborating through GitHub. Work is segregated across the core engine, channel adapters, and developer tooling to eliminate merge conflicts and maintain continuous shipping velocity.
        </p>
      </div>

      {/* 3-Student Responsibility Matrix */}
      <div>
        <h3 className={`text-base font-bold flex items-center space-x-2 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Users className="w-5 h-5 text-indigo-500" />
          <span>Team Member Responsibilities (3 Students)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
                isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-indigo-400">{member.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {member.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{member.role}</h4>
                <p className="text-xs text-slate-400 mb-3">{member.focus}</p>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                    Assigned Deliverables:
                  </span>
                  {member.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Git branch: feat/*</span>
                <span>PR Review: Mandatory</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Phase Roadmap Timeline */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>8-Week Timeline (4 Sprints)</span>
        </h3>

        <div className="space-y-4">
          {PHASES.map((phase, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border transition-all ${
                phase.current
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-white font-mono">{phase.number}:</span>
                  <span className="text-base font-semibold text-slate-200">{phase.name}</span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">({phase.weeks})</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-mono self-start sm:self-auto ${phase.badgeColor}`}>
                  {phase.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                {phase.goals.map((goal, gIdx) => (
                  <div key={gIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-indigo-400 font-mono">▸</span>
                    <span className="text-slate-300 text-[11px] leading-normal">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1 Verification Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Phase 1 Verification Checklist (Grading Criteria Ready)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            'Modular folder structure with docs/ and .github/',
            'Normalized /api/v1/chat Express Gateway',
            'Full README.md with ASCII pipeline diagram',
            'CONTRIBUTING.md with Git flow rules',
            'CHANGELOG.md adhering to standard format',
            'Open-source MIT LICENSE file included',
            'docs/ARCHITECTURE.md specification',
            'docs/API_SPECIFICATION.md payload schemas',
            'docs/INTEGRATION_GUIDE.md code samples',
            'docs/TEAM_MILESTONES.txt role breakdown',
            'docs/SECURITY_MODEL.md auth & HMAC specs',
            '.github/workflows/ci.yml build test',
            '.github/workflows/bot-verification.yml Action Bot',
            'React Sandbox for live channel simulation',
            'Interactive REST API playground in portal',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-slate-300 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
