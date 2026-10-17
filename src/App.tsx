/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ChannelSandbox } from './components/ChannelSandbox.tsx';
import { IntegrationHub } from './components/IntegrationHub.tsx';
import { DocExplorer } from './components/DocExplorer.tsx';
import { ActionBotVerifier } from './components/ActionBotVerifier.tsx';
import { TeamRoadmap } from './components/TeamRoadmap.tsx';
import { Bot, Terminal, GitBranch, Github, Shield, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'integrations' | 'docs' | 'actionbot' | 'roadmap'>('sandbox');
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    uptimeSeconds: number;
    aiProvider: string;
  } | null>(null);

  useEffect(() => {
    // Initial health check
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        setSystemHealth({
          status: data.status || 'healthy',
          uptimeSeconds: data.uptimeSeconds || 0,
          aiProvider: data.aiProvider || 'Universal Gateway',
        });
      })
      .catch(() => {
        setSystemHealth({
          status: 'online',
          uptimeSeconds: 1,
          aiProvider: 'Universal Gateway',
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'sandbox' && <ChannelSandbox />}
        {activeTab === 'integrations' && <IntegrationHub />}
        {activeTab === 'docs' && <DocExplorer />}
        {activeTab === 'actionbot' && <ActionBotVerifier />}
        {activeTab === 'roadmap' && <TeamRoadmap />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-400">OmniCore Universal Chatbot System</span>
            <span>•</span>
            <span>College Capstone Project</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-indigo-400">Phase 1 Foundation</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('docs')}
              className="hover:text-slate-300 transition-colors"
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('actionbot')}
              className="hover:text-slate-300 transition-colors"
            >
              Action Bot CI
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className="hover:text-slate-300 transition-colors"
            >
              2-Month Roadmap
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
