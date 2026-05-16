import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, RefreshCw, FileText, CheckCircle, Calendar, Trash2, ExternalLink, Database, Filter } from 'lucide-react';
import { ingestAllForUser, removeItem } from '../services/ragIngestionService';
import { retrieveContext, RetrievalResult } from '../services/ragRetrievalService';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

interface KnowledgeChunk {
  id: string;
  content: string;
  source_type: 'note' | 'task' | 'event';
  source_id: string;
  created_at: string;
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, notes: 0, tasks: 0, events: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RetrievalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'search'>('explorer');
  
  // Explorer State
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isFetchingChunks, setIsFetchingChunks] = useState(false);
  const [explorerFilter, setExplorerFilter] = useState<string>('all');

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('source_type', { count: 'exact' })
      .eq('user_id', user.id);

    if (!error && data) {
      const counts = data.reduce((acc: any, curr: any) => {
        const type = curr.source_type + 's';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, { total: 0, notes: 0, tasks: 0, events: 0 });
      setStats({ ...counts, total: data.length });
    }
  }, [user]);

  const fetchChunks = useCallback(async () => {
    if (!user) return;
    setIsFetchingChunks(true);
    let query = supabase
      .from('knowledge_chunks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (explorerFilter !== 'all') {
      query = query.eq('source_type', explorerFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setChunks(data as KnowledgeChunk[]);
    }
    setIsFetchingChunks(false);
  }, [user, explorerFilter]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchChunks();
    }
  }, [user, fetchStats, fetchChunks]);

  const handleSync = async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    try {
      await ingestAllForUser(user.id, (p) => setSyncProgress(p));
      toast.success('Knowledge Base synchronized!');
      await fetchStats();
      await fetchChunks();
    } catch (error) {
      toast.error('Sync failed');
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await retrieveContext(user.id, searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast.error('Retrieval error');
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteChunk = async (id: string) => {
    if (!window.confirm('Delete this knowledge chunk? This will not delete the original source.')) return;
    try {
      const { error } = await supabase.from('knowledge_chunks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Chunk purged');
      setChunks(chunks.filter(c => c.id !== id));
      fetchStats();
    } catch (err) {
      toast.error('Purge failed');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="app-page">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text leading-tight flex items-center gap-3">
            <Brain className="text-primary" size={32} />
            Knowledge Base
          </h1>
          <p className="text-sm text-text-variant mt-1 font-medium opacity-70">
            Monitor and manage your personal intelligence matrix.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
            isSyncing 
              ? 'bg-primary/20 text-primary cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-secondary text-white shadow-primary/20 hover:shadow-primary/40'
          }`}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? `Indexing ${syncProgress}%` : 'Rebuild Vault'}
        </button>
      </motion.div>

      {/* ── Stats Overview ─────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Intelligence Matrix', value: stats.total, icon: Database, color: 'text-primary' },
          { label: 'Note Contexts', value: stats.notes, icon: FileText, color: 'text-blue-400' },
          { label: 'Task Contexts', value: stats.tasks, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Event Contexts', value: stats.events, icon: Calendar, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item} className="glass p-5 rounded-3xl border border-primary/5 flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-primary/5 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-text-variant opacity-50">{stat.label}</p>
              <p className="text-xl font-black text-text">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Explorer/Search */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="glass rounded-[2.5rem] border border-primary/5 overflow-hidden flex flex-col h-[650px] shadow-2xl shadow-primary/5">
            {/* Tabs */}
            <div className="flex border-b border-white/5 p-2 gap-2 bg-primary/5">
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'explorer' ? 'bg-primary/10 text-primary shadow-inner' : 'text-text-variant hover:bg-white/5'
                }`}
              >
                Explorer
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'search' ? 'bg-primary/10 text-primary shadow-inner' : 'text-text-variant hover:bg-white/5'
                }`}
              >
                Playground
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'explorer' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-text-variant uppercase tracking-widest opacity-60">
                      Indexed Knowledge Chunks (Limit 50)
                    </p>
                    <div className="flex gap-2">
                      {['all', 'note', 'task', 'event'].map(f => (
                        <button
                          key={f}
                          onClick={() => setExplorerFilter(f)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            explorerFilter === f ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-white/5 text-text-variant hover:border-white/20'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isFetchingChunks ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-pulse">
                      <RefreshCw size={40} className="animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Matrix...</p>
                    </div>
                  ) : chunks.length > 0 ? (
                    <div className="space-y-3">
                      {chunks.map((chunk) => (
                        <motion.div
                          key={chunk.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/10 transition-all group relative"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              chunk.source_type === 'note' ? 'bg-blue-500/10 text-blue-400' :
                              chunk.source_type === 'task' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {chunk.source_type}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleDeleteChunk(chunk.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-text/80 leading-relaxed italic">
                            "{chunk.content}"
                          </p>
                          <p className="text-[8px] text-text-variant mt-2 font-mono opacity-30">
                            ID: {chunk.id} • {new Date(chunk.created_at).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <Brain size={60} />
                      <p className="mt-4 font-black uppercase text-[10px] tracking-widest">No intelligence found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Semantic query... (e.g. 'Show me my strategic objectives')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full bg-white/5 border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-text focus:outline-none focus:border-primary/30 transition-all placeholder:text-text-variant/30"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-variant opacity-50" size={20} />
                    <button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-xl hover:bg-primary-light transition-all active:scale-90 shadow-lg shadow-primary/20"
                    >
                      {isSearching ? '...' : 'Search'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              result.sourceType === 'note' ? 'bg-blue-500/10 text-blue-400' :
                              result.sourceType === 'task' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {result.sourceType}
                            </span>
                            <span className="text-[9px] font-black text-primary/60">
                              {(result.similarity * 100).toFixed(1)}% Match
                            </span>
                          </div>
                          <p className="text-sm text-text leading-relaxed">
                            {result.content}
                          </p>
                        </motion.div>
                      ))
                    ) : searchQuery && !isSearching ? (
                      <div className="text-center py-20 text-text-variant opacity-60 italic text-sm">
                        No semantic matches for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="text-center py-20 text-text-variant opacity-40 italic text-sm">
                        Enter a query to test neural retrieval.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tips & Status */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <motion.div variants={item} initial="hidden" animate="show" className="glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 bg-primary/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text mb-6 opacity-60 flex items-center gap-2">
              <Filter size={14} /> Pipeline Architecture
            </h3>
            <div className="space-y-5">
              {[
                { step: 1, title: 'Chunking', desc: 'Content is split into context-aware snippets.', color: 'bg-primary/20 text-primary' },
                { step: 2, title: 'Embedding', desc: 'Gemini creates 768-dimensional neural vectors.', color: 'bg-blue-500/20 text-blue-400' },
                { step: 3, title: 'Vectorization', desc: 'Stored in pgvector with HNSW indexing.', color: 'bg-purple-500/20 text-purple-400' },
              ].map((s, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center font-black text-[10px] shrink-0`}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">{s.title}</p>
                    <p className="text-[10px] text-text-variant mt-1 leading-relaxed opacity-70">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Brain size={120} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text mb-4 opacity-60">
              REAL-TIME STATUS
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
              <p className="text-[10px] font-black text-text uppercase tracking-widest">Active Indexing</p>
            </div>
            <p className="text-[10px] text-text-variant mt-4 leading-relaxed opacity-60">
              The neural index is automatically updated when you interact with notes, tasks, or events.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
