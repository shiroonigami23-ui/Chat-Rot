import React from 'react';
import { 
  Bot, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  BookOpen, 
  Share2, 
  Calendar, 
  Users 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'sandbox' | 'integrations' | 'docs' | 'actionbot' | 'roadmap';
  setActiveTab: (tab: 'sandbox' | 'integrations' | 'docs' | 'actionbot' | 'roadmap') => void;
  systemHealth: {
    status: string;
    uptimeSeconds: number;
    aiProvider: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">OmniCore</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Phase 1: Foundation
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Universal Chatbot Engine & Integration Gateway (College Capstone)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Integrations & SDK</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'docs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">2-Month Roadmap</span>
              <span className="md:hidden">Roadmap</span>
            </button>
          </nav>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 pl-2 border-l border-slate-800">
            <div className="text-right">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Gateway Online</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                {systemHealth?.aiProvider?.includes('gemini') ? 'Gemini 3.8 Flash' : 'Simulated Engine'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
