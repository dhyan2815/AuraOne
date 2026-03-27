import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Globe } from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Global Feed</span>
          <Newspaper className="w-5 h-5 text-slate-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-3">
                <Globe className="text-primary animate-spin" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-500 animate-pulse">Scanning Feeds...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-4 text-center"
            >
              <div className="bg-red-500/10 p-4 rounded-lg">
                <p className="text-xs font-bold text-red-500">{error}</p>
              </div>
            </motion.div>
          ) : news.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-3">
                    <Newspaper className="text-primary/40" />
                </div>
                <p className="text-sm font-bold text-text">No news found</p>
                <p className="text-xs text-slate-500 mt-1">Check back later</p>
            </motion.div>
          ) : (
            <motion.div
              key="news-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {news.slice(0, 3).map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 bg-slate-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all border border-slate-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                          {item.source}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default NewsWidget;

