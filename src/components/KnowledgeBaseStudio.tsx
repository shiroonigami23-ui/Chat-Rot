import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Tag, 
  Clock, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Download,
  FileText,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { KnowledgeItem } from '../../backend/types/universal.types.ts';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'capstone', label: 'Senior Capstone' },
  { id: 'courses', label: 'Courses & Catalog' },
  { id: 'technical', label: 'Technical Infrastructure' },
  { id: 'policies', label: 'Academic Policies' },
  { id: 'general', label: 'General Knowledge' },
];

export const KnowledgeBaseStudio: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Test Semantic Query State
  const [testQuery, setTestQuery] = useState<string>('What are the CS499 prerequisites and deadlines?');
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    title: string;
    category: string;
    similarity: number;
    snippet: string;
  }> | null>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);

  // New Chunk Form Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'policies' | 'courses' | 'technical' | 'capstone' | 'general'>('capstone');
  const [newTags, setNewTags] = useState<string>('capstone, rules, 2026');
  const [newContent, setNewContent] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('Team Member 1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/knowledge-base');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error('Failed to load knowledge base items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/knowledge-base/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
      }
    } catch (e) {
      console.error('Failed to toggle item:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this knowledge document chunk?')) return;
    try {
      const res = await fetch(`/api/v1/knowledge-base/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setQueryLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge-base/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, topK: 3 }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResults(data.results);
      }
    } catch (e) {
      console.error('Semantic search failed:', e);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleCreateChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/v1/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          tags: newTags.split(',').map((s) => s.trim()).filter(Boolean),
          content: newContent.trim(),
          author: newAuthor.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewContent('');
      }
    } catch (e) {
      console.error('Failed to create chunk:', e);
    }
  };

  const handleExportKnowledge = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnicore_knowledge_base_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = items.filter((it) => {
    const matchesCat = selectedCategory === 'all' || it.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      !q || 
      it.title.toLowerCase().includes(q) || 
      it.content.toLowerCase().includes(q) || 
      it.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const totalWords = items.reduce((acc, it) => acc + it.content.split(/\s+/).length, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Knowledge Base &amp; RAG Vector Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  Retrieval Augmented
                </span>
              </div>
              <p className={`text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Index departmental documentation, course prerequisites, and enterprise guidelines. OmniCore automatically performs hybrid vector similarity matching to inject authoritative grounding context into model prompts with verified citations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportKnowledge}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-all ${
                isDark 
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Chunk</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/40">
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Chunks</div>
            <div className={`text-xl font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {items.filter((i) => i.enabled).length} <span className="text-xs text-slate-500 font-normal">/ {items.length} total</span>
            </div>
          </div>
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Indexed Words</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-cyan-500">
              {totalWords.toLocaleString()}
            </div>
          </div>
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Retrieval Model</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-indigo-500">
              Hybrid TF-Vector
            </div>
          </div>
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Grounding Mode</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-emerald-500">
              Auto-Injected
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Semantic Retrieval Tester */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Test Semantic Vector Retrieval
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
          }`}>
            Live Similarity Engine
          </span>
        </div>
        <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Simulate what knowledge snippets OmniCore retrieves when an incoming prompt hits the gateway.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter student query (e.g. 'How do I submit SSH keys for SLURM?')"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
            />
          </div>

          <button
            onClick={handleTestSearch}
            disabled={queryLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            {queryLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Run Semantic Search</span>
          </button>
        </div>

        {/* Test Search Results */}
        {testResults && (
          <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Matched Chunks ({testResults.length})
              </span>
              <span className="text-slate-500 font-mono">Similarity Threshold: &gt;= 0.35</span>
            </div>

            {testResults.length === 0 ? (
              <div className={`p-4 rounded-xl text-center text-xs ${isDark ? 'bg-slate-950/60 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                No matching chunks found above relevance threshold. Query did not trigger RAG context injection.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.map((res) => (
                  <div
                    key={res.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {res.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                          res.similarity > 0.7 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                        }`}>
                          {Math.round(res.similarity * 100)}% Match
                        </span>
                      </div>
                      <p className={`line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {res.snippet}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/30 text-[11px] text-slate-500">
                      <span className="capitalize">Category: {res.category}</span>
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready to Inject</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Library / Chunk Catalog */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Institutional Knowledge Chunks ({filteredItems.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Pills */}
            <div className="flex items-center overflow-x-auto space-x-1 p-1 rounded-xl bg-slate-950/40 border border-slate-800/60">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Text Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Chunk List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading Knowledge Base Chunks...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={`p-8 rounded-xl text-center text-sm ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            No knowledge chunks found matching your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((chunk) => (
              <div
                key={chunk.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                } ${!chunk.enabled ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {chunk.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                        chunk.category === 'capstone'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : chunk.category === 'technical'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : chunk.category === 'policies'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {chunk.category}
                      </span>
                      {chunk.enabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active in RAG</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          Disabled
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {chunk.content}
                    </p>

                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{chunk.tags.join(', ')}</span>
                      </div>
                      <span>•</span>
                      <span>Author: {chunk.author}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(chunk.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleToggle(chunk.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        chunk.enabled
                          ? isDark
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={chunk.enabled ? 'Click to disable for RAG' : 'Click to enable for RAG'}
                    >
                      {chunk.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(chunk.content);
                        setCopiedId(chunk.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`p-1.5 rounded-lg border text-slate-400 hover:text-white transition-all ${
                        isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Copy chunk text"
                    >
                      {copiedId === chunk.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(chunk.id)}
                      className={`p-1.5 rounded-lg border text-slate-400 hover:text-rose-400 transition-all ${
                        isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-rose-50 text-slate-600'
                      }`}
                      title="Delete chunk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Knowledge Chunk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Add New Knowledge Chunk</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChunk} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Document / Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lab Safety Protocol & Keycard Access"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="capstone">Senior Capstone</option>
                    <option value="courses">Courses &amp; Catalog</option>
                    <option value="technical">Technical Infrastructure</option>
                    <option value="policies">Academic Policies</option>
                    <option value="general">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Author / Team Member
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Student Name"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tags (comma-separated keywords for hybrid indexing)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="ssh, git, lab, server"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Chunk Content / Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste rules, prerequisite lists, or factual knowledge here..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium ${
                    isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Save &amp; Index Chunk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
