import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Folder, 
  Search, 
  Copy, 
  Check, 
  Download, 
  GitBranch, 
  ChevronRight,
  GitPullRequest,
  ExternalLink,
  Code,
  Sparkles,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface RepoDocument {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  content: string;
}

export const DocExplorer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [documents, setDocuments] = useState<RepoDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('changelog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSyncGuide, setShowSyncGuide] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/docs-content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        }
      })
      .catch((err) => {
        console.error('Failed to load docs from backend:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyContent = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (doc: RepoDocument) => {
    const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Extract base filename
    const filename = doc.path.split('/').pop() || doc.name;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const combined = documents
      .map((d) => `================================================================================\nFILE: ${d.path}\n================================================================================\n\n${d.content}\n\n`)
      .join('\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'OmniCore-Project-Docs-Archive.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono mb-1 font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>CAPSTONE PROJECT REPOSITORY DOCUMENTATION</span>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Project Governance, CHANGELOG &amp; Technical Specifications
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Explore official repository documentation, architecture specifications, and CHANGELOG.md generated for evaluation and GitHub CI tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSyncGuide(!showSyncGuide)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
              showSyncGuide 
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>{showSyncGuide ? 'Hide GitHub Sync Tip' : 'GitHub Sync Tip'}</span>
          </button>

          <button
            onClick={handleDownloadAll}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export All Docs (.txt)</span>
          </button>
        </div>
      </div>

      {/* GitHub Sync Information Notice */}
      {showSyncGuide && (
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border-indigo-500/30' 
            : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200 shadow-sm'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <h4 className={`text-sm font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>Why CHANGELOG.md hasn&apos;t appeared in your GitHub repository yet</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                    Sync Required
                  </span>
                </h4>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Files in Google AI Studio are created in this active sandbox workspace. Remote GitHub repositories do not auto-pull cloud sandbox files until you commit them. To display <code className="text-indigo-400 font-mono font-bold">CHANGELOG.md</code> right next to <code className="text-indigo-400 font-mono">README.md</code> and <code className="text-indigo-400 font-mono">LICENSE</code> on GitHub:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Method 1: GitHub Web UI */}
                <div className={`p-3.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-indigo-100 shadow-sm'
                }`}>
                  <div className="font-bold flex items-center space-x-2 text-indigo-400 mb-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Method 1: Add via GitHub Web UI (30 Seconds)</span>
                  </div>
                  <ol className={`space-y-1 text-[11px] list-decimal list-inside ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>In your GitHub repo, click <strong>Add file &gt; Create new file</strong></li>
                    <li>Name it <code className="text-indigo-400 font-mono">CHANGELOG.md</code></li>
                    <li>Click <strong>&quot;Download CHANGELOG.md&quot;</strong> below or click <strong>Copy Content</strong> and paste it</li>
                    <li>Click green <strong>&quot;Commit changes...&quot;</strong> button</li>
                  </ol>
                </div>

                {/* Method 2: Git Command Line */}
                <div className={`p-3.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-indigo-100 shadow-sm'
                }`}>
                  <div className="font-bold flex items-center space-x-2 text-emerald-400 mb-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>Method 2: Via Git Command Line</span>
                  </div>
                  <pre className={`p-2 rounded font-mono text-[10px] overflow-x-auto select-all ${
                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {`# Download CHANGELOG.md & action bot files into your local clone:\ngit add CHANGELOG.md scripts/ .github/workflows/\ngit commit -m "docs: add CHANGELOG.md and Smart Action Bot"\ngit push origin main`}
                  </pre>
                </div>
              </div>

              {/* Quick File Download Buttons */}
              <div className="mt-3.5 pt-3 border-t border-indigo-500/20 flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Quick Downloads for GitHub:
                </span>
                {documents.find((d) => d.id === 'changelog') && (
                  <button
                    onClick={() => handleDownloadSingleFile(documents.find((d) => d.id === 'changelog')!)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download CHANGELOG.md</span>
                  </button>
                )}
                {documents.find((d) => d.id === 'changelog_bot_wf') && (
                  <button
                    onClick={() => handleDownloadSingleFile(documents.find((d) => d.id === 'changelog_bot_wf')!)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center space-x-1.5 border transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download changelog-bot.yml</span>
                  </button>
                )}
                {documents.find((d) => d.id === 'changelog_script') && (
                  <button
                    onClick={() => handleDownloadSingleFile(documents.find((d) => d.id === 'changelog_script')!)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center space-x-1.5 border transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download update-changelog.js</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Left File Tree Navigator */}
        <div className={`lg:col-span-4 p-4 rounded-2xl border transition-colors flex flex-col shadow-xl ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter repository files..."
              className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* File Groups */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Core Docs */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                <span>Root Governance</span>
              </div>
              <div className="space-y-1">
                {filteredDocs
                  .filter((d) => (!d.path.includes('/') || d.path.startsWith('.')) && !d.path.startsWith('.github/'))
                  .map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    const isChangelog = doc.id === 'changelog';
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${isChangelog ? 'text-indigo-300' : ''}`} />
                          <span className={`truncate ${isChangelog ? 'font-bold' : ''}`}>{doc.name}</span>
                          {isChangelog && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                              CI Bot
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* docs/ folder */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>docs/ Specifications</span>
              </div>
              <div className="space-y-1">
                {filteredDocs
                  .filter((d) => d.path.startsWith('docs/'))
                  .map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* .github/ folder */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>.github/ Workflows</span>
              </div>
              <div className="space-y-1">
                {filteredDocs
                  .filter((d) => d.path.startsWith('.github/'))
                  .map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* scripts/ folder */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>scripts/ Automation</span>
              </div>
              <div className="space-y-1">
                {filteredDocs
                  .filter((d) => d.path.startsWith('scripts/'))
                  .map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Viewer */}
        <div className={`lg:col-span-8 border rounded-2xl flex flex-col shadow-xl overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          {/* Document Header */}
          <div className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className={`font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedDoc?.path || 'CHANGELOG.md'}
              </span>
              {selectedDoc?.sizeBytes ? (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {selectedDoc.sizeBytes} bytes
                </span>
              ) : null}
              {selectedDoc?.id === 'changelog' && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Updated on Push</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedDoc && (
                <button
                  onClick={() => handleDownloadSingleFile(selectedDoc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border font-mono ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Download this file to your computer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download</span>
                </button>
              )}

              <button
                onClick={handleCopyContent}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border font-mono ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied File!' : 'Copy Content'}</span>
              </button>
            </div>
          </div>

          {/* Document Body */}
          <div className={`flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed transition-colors ${
            isDark ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-50 text-slate-800'
          }`}>
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading repository documents...
              </div>
            ) : selectedDoc ? (
              <pre className="whitespace-pre-wrap select-text selection:bg-indigo-500/30 font-mono">
                {selectedDoc.content}
              </pre>
            ) : (
              <div className="text-slate-500">Select a document from the left navigation tree.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
