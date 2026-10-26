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
import { KnowledgeBaseStudio } from './components/KnowledgeBaseStudio.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { FloatingWidgetSimulator } from './components/FloatingWidgetSimulator.tsx';
import { ReleasesHub } from './components/ReleasesHub.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';

function MainApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'sandbox' | 'releases' | 'integrations' | 'knowledge' | 'analytics' | 'docs' | 'actionbot' | 'roadmap'>('sandbox');
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
          aiProvider: data.aiProvider || 'ChatRot Gateway',
        });
      })
      .catch(() => {
        setSystemHealth({
          status: 'online',
          uptimeSeconds: 1,
          aiProvider: 'ChatRot Gateway',
        });
      });
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900'
    }`}>
      {/* Top Navbar with Theme Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'sandbox' && <ChannelSandbox />}
        {activeTab === 'releases' && <ReleasesHub />}
        {activeTab === 'integrations' && <IntegrationHub />}
        {activeTab === 'knowledge' && <KnowledgeBaseStudio />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'docs' && <DocExplorer />}
        {activeTab === 'actionbot' && <ActionBotVerifier />}
        {activeTab === 'roadmap' && <TeamRoadmap />}
      </main>

      {/* Live Floating Drop-In Widget Simulator */}
      <FloatingWidgetSimulator />

      {/* Footer */}
      <footer className={`border-t py-6 text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white text-slate-600 shadow-inner'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              ChatRot Gateway Platform
            </span>
            <span>•</span>
            <span>shiroonigami23-ui/Chat-Rot</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-emerald-500 font-medium">v1.0.0 Ready</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('releases')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Releases &amp; Packages
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('actionbot')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Action Bot CI
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}
            >
              Roadmap
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
