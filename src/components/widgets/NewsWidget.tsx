import { useState, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
}

interface ApiNewsItem {
  title: string;
  source_id: string;
  link: string;
  pubDate: string;
  image_url?: string;
}

const CATEGORIES = ["Trends", "Weekly Focus", "Insights", "Pulse", "Editorial"];

const NewsWidget = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_CONFIG.NEWS_API_URL}/news?apikey=${API_CONFIG.NEWS_API_KEY}&country=in&language=en`
        );
        if (!res.ok) throw new Error("Connection unstable");
        const data = await res.json();
        setNews(
          data.results.slice(0, 5).map((item: ApiNewsItem, i: number) => ({
            id: i.toString(),
            title: item.title,
            source: item.source_id,
            url: item.link,
            imageUrl: item.image_url,
            publishedAt: item.pubDate,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <Globe size={24} className="text-primary/60 animate-spin" />
        <p className="text-sm text-text-variant animate-pulse font-semibold">Scanning feeds…</p>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-text-variant">{error || "No articles found"}</p>
      </div>
    );
  }

  const [featured, ...rest] = news;

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {/* Featured article with image */}
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block cursor-pointer"
        >
          {featured.imageUrl ? (
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="w-full h-32 object-cover rounded-2xl mb-3 group-hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-indigo-500/5"
            />
          ) : (
            <div className="w-full h-32 rounded-2xl mb-3 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center border border-primary/5">
              <Globe size={32} className="text-primary/40" />
            </div>
          )}
          <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-1">
            {CATEGORIES[0]}
          </p>
          <h4 className="font-bold text-sm leading-snug text-text group-hover:text-primary transition-colors line-clamp-2">
            {featured.title}
          </h4>
        </motion.a>

        {/* Smaller articles */}
        {rest.map((item, idx) => (
          <motion.a
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.08 }}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-primary/5 flex items-center justify-center border border-primary/5">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <ExternalLink size={16} className="text-primary/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                {CATEGORIES[idx + 1] || item.source}
              </p>
              <h4 className="font-bold text-xs leading-snug text-text group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h4>
            </div>
          </motion.a>
        ))}
      </div>
    </AnimatePresence>

  );
};

export default NewsWidget;
