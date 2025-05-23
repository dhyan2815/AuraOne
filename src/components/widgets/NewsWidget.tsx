import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

// Mock news data
const mockNewsData = [
  {
    id: '1',
    title: 'Tech Giants Announce New AI Partnerships',
    source: 'Tech Today',
    url: '#',
    publishedAt: '2023-06-12T13:45:00Z',
  },
  {
    id: '2',
    title: 'Scientists Discover New Renewable Energy Source',
    source: 'Science Daily',
    url: '#',
    publishedAt: '2023-06-12T11:20:00Z',
  },
  {
    id: '3',
    title: 'Global Markets Respond to Economic Policy Changes',
    source: 'Financial Times',
    url: '#',
    publishedAt: '2023-06-12T08:15:00Z',
  },
  {
    id: '4',
    title: 'New Study Reveals Benefits of Remote Work',
    source: 'Work Lifestyle',
    url: '#',
    publishedAt: '2023-06-12T07:30:00Z',
  },
];

const NewsWidget = () => {
  const [news, setNews] = useState(mockNewsData);
  const [loading, setLoading] = useState(false);
  
  // In a real application, you would fetch news data from NewsAPI
  useEffect(() => {
    // Simulating API loading
    setLoading(true);
    setTimeout(() => {
      setNews(mockNewsData);
      setLoading(false);
    }, 1000);
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      {news.map((item) => (
        <a 
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 py-2 rounded-md transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{item.title}</h4>
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