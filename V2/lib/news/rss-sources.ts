// RSS feed sources configuration
export interface RSSSource {
  name: string;
  url: string;
  biasRating: string;
}

export const rssSources: Record<string, RSSSource> = {
  'the-guardian': {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    biasRating: 'lean-left'
  },
  'the-new-york-times': {
    name: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    biasRating: 'lean-left'
  },
  'reuters': {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/',
    biasRating: 'center'
  },
  'wall-street-journal': {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    biasRating: 'lean-right'
  },
  'fox-news': {
    name: 'Fox News',
    url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
    biasRating: 'right'
  }
};

export const getAllSources = (): RSSSource[] => {
  return Object.values(rssSources);
};

export const getSourceByKey = (key: string): RSSSource | undefined => {
  return rssSources[key];
};
