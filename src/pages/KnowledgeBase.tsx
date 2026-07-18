// Render the KnowledgeBase management console, allowing users to synchronize database content into vectors, search documents semantically, and manage activity chunks.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Brain, Search, RefreshCw, FileText, CheckCircle, Calendar, Database } from 'lucide-react';
import ChunkCard from '../components/ui/ChunkCard';
import { ingestAllForUser } from '../services/ragIngestionService';
import { retrieveContext, RetrievalResult } from '../services/ragRetrievalService';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Define layout data structure for indexed knowledge data chunks.
interface KnowledgeChunk {
  id: string;
  content: string;
  source_type: 'note' | 'task' | 'event';
  source_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

const KnowledgeBase = () => {
  // Retrieve credentials of the current authenticated user context.
  const { user } = useAuth();
  
  // Track indices count stats, synchronization states, and semantic queries.
  const [stats, setStats] = useState({ total: 0, notes: 0, tasks: 0, events: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RetrievalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'search'>('explorer');
  
  // Manage list of loaded chunks, explorer filter tabs, and page loaders.
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isFetchingChunks, setIsFetchingChunks] = useState(false);
  const [explorerFilter, setExplorerFilter] = useState<string>('all');

  // Query database chunk counts classified by source types.
  const fetchStats = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('source_type', { count: 'exact' })
      .eq('user_id', user.id);

    if (!error && data) {
      const counts = data.reduce((acc: { total: number; notes: number; tasks: number; events: number }, curr: { source_type: string }) => {
        const type = curr.source_type + 's';
        acc[type as keyof typeof acc] = (acc[type as keyof typeof acc] || 0) + 1;
        return acc;
      }, { total: 0, notes: 0, tasks: 0, events: 0 });
      setStats({ ...counts, total: data.length });
    }
  }, [user]);

  // Load a paginated list of knowledge chunks matching the current explorer tab filter.
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

  // Re-fetch database stats and chunk details when the user changes or the active filter updates.
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchChunks();
    }
  }, [user, fetchStats, fetchChunks]);

  // Trigger full context indexing pipeline to regenerate vector embeddings for user content.
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

  // Perform semantic retrieval over the indexed database using local/remote embeddings.
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

  // Purge a specific chunk from the vector store while leaving original entity records intact.
  const handleDeleteChunk = async (id: string) => {
    if (!window.confirm('Delete this knowledge chunk? This will not delete the original source.')) return;
    try {
      const { error } = await supabase.from('knowledge_chunks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Chunk purged');
      setChunks(chunks.filter(c => c.id !== id));
      fetchStats();
    } catch {
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
        className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text leading-tight flex items-center gap-2 sm:gap-3">
            <Brain size={26} className="text-primary sm:w-[32px] sm:h-[32px]" />
            Recent Activity
          </h1>
          <p className="text-xs sm:text-sm text-text-variant mt-1 font-medium opacity-70">
            See your recent activities you've done across tasks, notes, events, and calendar.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl w-full sm:w-auto ${
            isSyncing 
              ? 'bg-primary/20 text-primary cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-secondary text-white shadow-primary/20 hover:shadow-primary/40'
          }`}
        >
          <RefreshCw size={12} className={`sm:w-[14px] sm:h-[14px] ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? `Indexing ${syncProgress}%` : 'Refresh Activity'}
        </button>
      </motion.div>

      {/* ── Stats Overview ─────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {[
          { label: 'Total Records', value: stats.total, icon: Database, color: 'text-primary' },
          { label: 'Note Contexts', value: stats.notes, icon: FileText, color: 'text-blue-400' },
          { label: 'Task Contexts', value: stats.tasks, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Event Contexts', value: stats.events, icon: Calendar, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item} className="glass p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-primary/5 flex items-center gap-2.5 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/5 ${stat.color} flex-shrink-0`}>
              <stat.icon size={16} className="sm:w-[20px] sm:h-[20px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-text-variant opacity-50 truncate">{stat.label}</p>
              <p className="text-base sm:text-xl font-black text-text">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Full-Width Column: Explorer/Search */}
        <div className="col-span-12 flex flex-col gap-6">
          <div className="glass rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-primary/5 overflow-hidden flex flex-col h-[550px] sm:h-[650px] shadow-2xl shadow-primary/5">
            {/* Tabs */}
            <div className="flex border-b border-white/5 p-1.5 sm:p-2 gap-1.5 sm:gap-2 bg-primary/5">
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'explorer' ? 'bg-primary/10 text-primary shadow-inner' : 'text-text-variant hover:bg-white/5'
                }`}
              >
                Explorer
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'search' ? 'bg-primary/10 text-primary shadow-inner' : 'text-text-variant hover:bg-white/5'
                }`}
              >
                Playground
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {activeTab === 'explorer' ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <p className="text-[9px] sm:text-[10px] font-bold text-text-variant uppercase tracking-widest opacity-60">
                      Activity List (Limit 50)
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
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
                        <ChunkCard
                          key={chunk.id}
                          id={chunk.id}
                          sourceType={chunk.source_type}
                          content={chunk.content}
                          metadata={chunk.metadata as Record<string, unknown>}
                          createdAt={chunk.created_at}
                          onDelete={handleDeleteChunk}
                        />
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
                        <ChunkCard
                          key={i}
                          id={result.id || i.toString()}
                          sourceType={result.sourceType}
                          content={result.content}
                          metadata={result.metadata as Record<string, unknown>}
                          similarity={result.similarity}
                          index={i}
                        />
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
      </div>
    </div>
  );
};

export default KnowledgeBase;
