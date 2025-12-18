// RSS feed sources configuration
export interface RSSSource {
  name: string;
  url: string;
  biasRating: string;
}

export const rssSources: Record<string, RSSSource> = {
  // Left-leaning sources
  'the-guardian': {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    biasRating: 'left'
  },
  'msnbc': {
    name: 'MSNBC',
    url: 'https://www.msnbc.com/feeds/latest',
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
    biasRating: 'leanLeft'
  },
  'the-new-york-times': {
    name: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    biasRating: 'leanLeft'
  },
  'washington-post': {
    name: 'Washington Post',
    url: 'https://feeds.washingtonpost.com/rss/world',
    biasRating: 'leanLeft'
  },
  
  // Center sources
  'bbc-news': {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    biasRating: 'center'
  },
  'reuters': {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/',
    biasRating: 'center'
  },
  'associated-press': {
    name: 'Associated Press',
    url: 'https://apnews.com/hub/world-news',
    biasRating: 'center'
  },
  
  // Lean-right sources
  'wall-street-journal': {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    biasRating: 'leanRight'
  },
  'the-hill': {
    name: 'The Hill',
    url: 'https://thehill.com/feed/',
    biasRating: 'leanRight'
  },
  'usa-today': {
    name: 'USA Today',
    url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories',
    biasRating: 'leanRight'
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
