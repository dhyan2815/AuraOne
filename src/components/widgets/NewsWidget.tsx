import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { API_CONFIG } from "../../config/api";

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
          // `${API_CONFIG.NEWS_API_URL}/news?apikey=${API_CONFIG.NEWS_API_KEY}&language=en&category=technology`
          `${API_CONFIG.NEWS_API_URL}/news?apikey=${API_CONFIG.NEWS_API_KEY}&country=in&language=en`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }

        const data = await response.json();

        // Transform the API response to match our interface
        const formattedNews = data.results.map((item: any, index: number) => ({
          id: index.toString(),
          title: item.title,
          source: item.source_id,
          url: item.link,
          publishedAt: item.pubDate,
        }));

        setNews(formattedNews);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch news data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-error-600 dark:text-error-400">{error}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {news.slice(0, 3).map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-3 py-1 rounded-md transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg">{item.title}</h4>
              <div className="flex items-center mt-1 text-sm text-slate-600 dark:text-slate-400">
                <span>{item.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(item.publishedAt)}</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-slate-400 mt-1 shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default NewsWidget;
