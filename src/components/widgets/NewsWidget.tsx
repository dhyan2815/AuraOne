// News Mini-Widget — Renders a dashboard sidebar news feed utilizing the NewsData API.

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
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

const NewsWidget = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
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
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3" role="status" aria-label="Loading news">
        <div className="lm-skel h-[150px] w-full !rounded-[20px]" />
        <div className="lm-skel h-5 w-3/4" />
        <div className="lm-skel h-4 w-1/2" />
      </div>
    );
  }

  if (error || news.length === 0) {
    return <p className="lm-error">{error || "No articles found"}</p>;
  }

  const [featured, ...rest] = news;

  return (
    <AnimatePresence>
      <div>
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {featured.imageUrl ? (
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="block h-[150px] w-full rounded-[20px] bg-step object-cover"
            />
          ) : (
            <div className="grid h-[150px] w-full place-items-center rounded-[20px] bg-step text-ink2">
              <Globe size={32} />
            </div>
          )}
          <p className="mt-3 line-clamp-3 text-[17px] font-bold leading-snug">{featured.title}</p>
          <p className="lm-muted">{featured.source}</p>
        </motion.a>

        <div className="mt-1.5">
          {rest.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lm-row"
            >
              <span className="line-clamp-2 min-w-0 flex-1">{item.title}</span>
              <span className="lm-muted ml-auto flex-none">{item.source}</span>
            </a>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NewsWidget;
