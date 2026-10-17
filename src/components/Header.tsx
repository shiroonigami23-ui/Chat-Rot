import React from 'react';
import { 
  Bot, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  BookOpen, 
  Share2, 
  Calendar, 
  Users,
  Sun,
  Moon,
  Database,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface HeaderProps {
  activeTab: 'sandbox' | 'integrations' | 'knowledge' | 'analytics' | 'docs' | 'actionbot' | 'roadmap';
  setActiveTab: (tab: 'sandbox' | 'integrations' | 'knowledge' | 'analytics' | 'docs' | 'actionbot' | 'roadmap') => void;
  systemHealth: {
    status: string;
    uptimeSeconds: number;
    aiProvider: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`border-b transition-colors backdrop-blur sticky top-0 z-50 ${
      isDark ? 'border-slate-800 bg-slate-950/80 text-white' : 'border-slate-200 bg-white/90 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  OmniCore
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono font-semibold">
                  Phase 1: Foundation
                </span>
              </div>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Universal Chatbot Engine &amp; Integration Gateway (College Capstone)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Channel Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'integrations'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
              <span className="sm:hidden">SDK</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'knowledge'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden md:inline">Knowledge (RAG)</span>
              <span className="md:hidden">RAG</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'docs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Repo Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('actionbot')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'actionbot'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="relative">
                Action Bot
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">2-Month Roadmap</span>
              <span className="md:hidden">Roadmap</span>
            </button>
          </nav>

          {/* Right Side: Theme Switcher & Status */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-indigo-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Presentation Light Mode' : 'Switch to Dark Slate Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* System Status Pill */}
            <div className={`hidden lg:flex items-center pl-3 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gateway Online</span>
                </div>
                <div className={`text-[10px] font-mono truncate max-w-[130px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {systemHealth?.aiProvider?.includes('gemini') ? 'Gemini 3.8 Flash' : 'Simulated Engine'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
