import type { BiasRating } from './rss-parser';

// RSS feed sources configuration
export interface RSSSource {
  name: string;
  url: string;
  biasRating: BiasRating;
}

export const rssSources: Record<string, RSSSource> = {
  // Left-leaning sources
  'the-guardian': {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    biasRating: 'left'
  },
  'nbc-news': {
    name: 'NBC News',
    url: 'https://www.nbcnews.com/rss/nbcnews/public/news',
    biasRating: 'left'
  },
  'huffington-post': {
    name: 'Huffington Post',
    url: 'https://www.huffpost.com/section/front-page/feed',
    biasRating: 'left'
  },
  
  // Lean-left sources
  'npr': {
    name: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    biasRating: 'lean-left'
  },
  'the-new-york-times': {
    name: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    biasRating: 'lean-left'
  },
  'washington-post': {
    name: 'Washington Post',
    url: 'https://feeds.washingtonpost.com/rss/world',
    biasRating: 'lean-left'
  },
  
  // Center sources
  'bbc-news': {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    biasRating: 'center'
  },
  'bloomberg': {
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/politics/news.rss',
    biasRating: 'center'
  },
  'axios': {
    name: 'Axios',
    url: 'https://api.axios.com/feed/',
    biasRating: 'center'
  },
  
  // Lean-right sources
  'wall-street-journal': {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    biasRating: 'lean-right'
  },
  'the-hill': {
    name: 'The Hill',
    url: 'https://thehill.com/feed/',
    biasRating: 'lean-right'
  },
  'washington-times': {
    name: 'The Washington Times',
    url: 'https://www.washingtontimes.com/rss/headlines/news/',
    biasRating: 'lean-right'
  },
  
  // Right-leaning sources
  'fox-news': {
    name: 'Fox News',
    url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
    biasRating: 'right'
  },
  'breitbart': {
    name: 'Breitbart',
    url: 'https://www.breitbart.com/feed/',
    biasRating: 'right'
  },
  'the-daily-wire': {
    name: 'The Daily Wire',
    url: 'https://www.dailywire.com/feeds/rss.xml',
    biasRating: 'right'
  }
};

export const getAllSources = (): RSSSource[] => {
  return Object.values(rssSources);
};

export const getSourceByKey = (key: string): RSSSource | undefined => {
  return rssSources[key];
};
