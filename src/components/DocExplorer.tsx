import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Folder, 
  Search, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  GitBranch, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface RepoDocument {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  content: string;
}

export const DocExplorer: React.FC = () => {
  const [documents, setDocuments] = useState<RepoDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('readme');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1">
            <BookOpen className="w-4 h-4" />
            <span>CAPSTONE PROJECT REPOSITORY DOCUMENTATION</span>
          </div>
          <h2 className="text-xl font-bold text-white">Project Governance & Technical Specifications</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Detailed architecture blueprints, API contracts, integration manuals, team roles, and GitHub workflow manifests created for team coordination and professor evaluation.
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20 shrink-0 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All Docs (.txt)</span>
        </button>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Left File Tree Navigator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter repository files..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
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
                  .filter((d) => !d.path.includes('/') || d.path.startsWith('.'))
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
          </div>
        </div>

        {/* Right Content Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          {/* Document Header */}
          <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs font-semibold text-white">
                {selectedDoc?.path || 'README.md'}
              </span>
              {selectedDoc?.sizeBytes ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedDoc.sizeBytes} bytes
                </span>
              ) : null}
            </div>

            <button
              onClick={handleCopyContent}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied File!' : 'Copy Content'}</span>
            </button>
          </div>

          {/* Document Body */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40 font-mono text-xs text-slate-300 leading-relaxed">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading repository documents...
              </div>
            ) : selectedDoc ? (
              <pre className="whitespace-pre-wrap select-text selection:bg-indigo-500/30">
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
