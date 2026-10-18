// Render the KnowledgeBase management console, allowing users to synchronize database content into vectors, search documents semantically, and manage activity chunks.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/Dialog';
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
  const [pendingChunk, setPendingChunk] = useState<string | null>(null);

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

  return (
    <div className="sec-know">
      <section className="lm-lobe">
        <h1>Knowledge</h1>
        <p>{stats.total} chunks Aura reads before it answers.</p>
        <div className="lm-acts">
          <div className="lm-seg" role="group" aria-label="View">
            <button onClick={() => setActiveTab('explorer')} aria-pressed={activeTab === 'explorer'}>Explorer</button>
            <button onClick={() => setActiveTab('search')} aria-pressed={activeTab === 'search'}>Playground</button>
          </div>
        </div>
      </section>

      <div className="lm-lift">
        {activeTab === 'search' && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="mb-5 flex max-w-[760px] items-center gap-2 rounded-full bg-sheet py-1.5 pl-[22px] pr-1.5"
          >
            <Search size={18} className="flex-none text-ink2" />
            <input
              type="text"
              placeholder="Search your knowledge, e.g. how much overlap for chunking?"
              aria-label="Search your knowledge"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent py-2 text-lg text-ink outline-none placeholder:text-ink2"
            />
            <button type="submit" disabled={isSearching} className="lm-btn">
              {isSearching ? '…' : 'Search'}
            </button>
          </form>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="lm-sheet min-h-[320px]">
            {activeTab === 'explorer' ? (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="lm-sheet-title !mb-0">{chunks.length} {chunks.length === 1 ? 'chunk' : 'chunks'}</h2>
                  <div className="lm-seg" role="group" aria-label="Filter by source">
                    {['all', 'note', 'task', 'event'].map(f => (
                      <button key={f} onClick={() => setExplorerFilter(f)} aria-pressed={explorerFilter === f} className="capitalize">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {isFetchingChunks ? (
                  <div className="grid gap-3 py-4" role="status" aria-label="Loading chunks">
                    <div className="lm-skel h-6 w-2/3" />
                    <div className="lm-skel h-6 w-full" />
                    <div className="lm-skel h-6 w-1/2" />
                  </div>
                ) : chunks.length > 0 ? (
                  <div>
                    {chunks.map((chunk, i) => (
                      <ChunkCard
                        key={chunk.id}
                        index={Math.min(i, 8)}
                        id={chunk.id}
                        sourceType={chunk.source_type}
                        content={chunk.content}
                        metadata={chunk.metadata as Record<string, unknown>}
                        createdAt={chunk.created_at}
                        onDelete={setPendingChunk}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-[19px]">Nothing indexed yet. Hit “Re-index all” to read your notes, tasks and events.</p>
                )}
              </>
            ) : (
              <>
                <h2 className="lm-sheet-title">
                  {searchResults.length > 0 ? `${searchResults.length} matching ${searchResults.length === 1 ? 'chunk' : 'chunks'}` : 'Playground'}
                </h2>
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
                  <p className="lm-muted py-6">No semantic matches for “{searchQuery}”.</p>
                ) : (
                  <p className="lm-muted py-6">Enter a query to test retrieval against your index.</p>
                )}
              </>
            )}
          </div>

          <div className="grid content-start gap-5">
            <div className="lm-sheet">
              <h2 className="lm-sheet-title">Index</h2>
              {[
                { label: 'Notes', value: stats.notes },
                { label: 'Tasks', value: stats.tasks },
                { label: 'Events', value: stats.events },
              ].map((s) => (
                <div key={s.label} className="flex justify-between py-2 font-semibold">
                  <span>{s.label}</span>
                  <span>{s.value} {s.value === 1 ? 'chunk' : 'chunks'}</span>
                </div>
              ))}
              <button onClick={handleSync} disabled={isSyncing} className="lm-btn mt-3 w-full">
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? `Indexing ${syncProgress}%` : 'Re-index all'}
              </button>
            </div>
            <div className="lm-sheet !bg-aura text-[#1F211E]">
              <h2 className="lm-sheet-title !text-[#1F211E]">Ask with sources</h2>
              <p>Aura cites the chunks it used, so you can trace every answer back to your own notes.</p>
              <Link to="/chat" className="lm-btn mt-3">Ask Aura</Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingChunk}
        onOpenChange={(open) => { if (!open) setPendingChunk(null); }}
        title="Delete this chunk?"
        body="This will not delete the original source."
        cancelLabel="Keep chunk"
        onConfirm={() => { if (pendingChunk) handleDeleteChunk(pendingChunk); }}
      />
    </div>
  );
};

export default KnowledgeBase;
