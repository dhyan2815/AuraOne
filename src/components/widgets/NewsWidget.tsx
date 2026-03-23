import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Globe } from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

const NewsWidget = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_CONFIG.NEWS_API_URL}/news?apikey=${API_CONFIG.NEWS_API_KEY}&country=in&language=en`
        );
        if (!response.ok) throw new Error("Connection unstable");
        const data = await response.json();
        const formattedNews = data.results.map((item: any, index: number) => ({
          id: index.toString(),
          title: item.title,
          source: item.source_id,
          url: item.link,
          publishedAt: item.pubDate,
        }));
        setNews(formattedNews);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to sync news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-3">
          <Globe className="text-primary animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-aurora-on-surface-variant animate-pulse">Scanning Global Feeds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-4">
        <div className="glass-panel p-4 rounded-2xl border-error/10 bg-error/5">
          <p className="text-xs font-bold text-error">{error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {news.slice(0, 3).map((item, idx) => (
            <motion.a
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 glass rounded-2xl hover:bg-white/50 transition-all border border-transparent hover:border-primary/10"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg glass-panel text-primary bg-primary/5">
                      {item.source}
                    </span>
                    <span className="text-[9px] font-bold text-aurora-on-surface-variant">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-aurora-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                </div>
                <div className="p-1.5 glass rounded-xl group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <ExternalLink size={12} />
                </div>
              </div>
            </motion.a>
          ))}
          {news.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-3">
                <Newspaper className="text-primary/40" />
              </div>
              <p className="text-sm font-black text-aurora-on-surface">No news found</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-aurora-on-surface-variant mt-1">Check back later</p>
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default NewsWidget;

