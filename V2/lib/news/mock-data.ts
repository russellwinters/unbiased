import { ParsedArticle } from './rss-parser';

/**
 * Mock RSS data for demonstration purposes
 * This is used when actual RSS feeds cannot be fetched (e.g., in restricted environments)
 */
export const mockArticles: ParsedArticle[] = [
  {
    title: 'Global Climate Summit Reaches Historic Agreement',
    description: 'World leaders have agreed to unprecedented climate action measures at the latest international summit, marking a significant shift in global environmental policy.',
    url: 'https://www.theguardian.com/environment/2024/12/climate-summit-agreement',
    imageUrl: 'https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Climate+Summit',
    publishedAt: new Date('2024-12-18T10:00:00Z'),
    source: {
      name: 'The Guardian',
      biasRating: 'lean-left'
    }
  },
  {
    title: 'Economic Indicators Show Mixed Signals for Markets',
    description: 'Latest economic data presents a complex picture as investors weigh inflation concerns against signs of growth in key sectors.',
    url: 'https://www.wsj.com/economy/markets-mixed-signals-2024',
    imageUrl: 'https://via.placeholder.com/800x400/2196F3/FFFFFF?text=Economy',
    publishedAt: new Date('2024-12-18T09:30:00Z'),
    source: {
      name: 'Wall Street Journal',
      biasRating: 'lean-right'
    }
  },
  {
    title: 'Breaking: Major Technology Company Announces Innovation',
    description: 'Tech giant unveils groundbreaking new technology expected to transform the industry and consumer experience.',
    url: 'https://www.nytimes.com/technology/2024/12/tech-innovation',
    imageUrl: 'https://via.placeholder.com/800x400/9C27B0/FFFFFF?text=Technology',
    publishedAt: new Date('2024-12-18T09:00:00Z'),
    source: {
      name: 'The New York Times',
      biasRating: 'lean-left'
    }
  },
  {
    title: 'International Trade Deal Signed Between Major Economies',
    description: 'A comprehensive trade agreement has been finalized, potentially reshaping global commerce and diplomatic relations.',
    url: 'https://www.reuters.com/world/trade-deal-signed-2024',
    imageUrl: 'https://via.placeholder.com/800x400/FF9800/FFFFFF?text=Trade',
    publishedAt: new Date('2024-12-18T08:30:00Z'),
    source: {
      name: 'Bloomberg',
      biasRating: 'center'
    }
  },
  {
    title: 'National Security Concerns Prompt Policy Review',
    description: 'Government officials announce comprehensive review of national security protocols following recent international developments.',
    url: 'https://www.foxnews.com/politics/national-security-review-2024',
    imageUrl: 'https://via.placeholder.com/800x400/F44336/FFFFFF?text=Security',
    publishedAt: new Date('2024-12-18T08:00:00Z'),
    source: {
      name: 'Fox News',
      biasRating: 'right'
    }
  },
  {
    title: 'Scientific Breakthrough in Medical Research Announced',
    description: 'Researchers report significant progress in developing new treatments, offering hope for millions of patients worldwide.',
    url: 'https://www.theguardian.com/science/2024/12/medical-breakthrough',
    imageUrl: 'https://via.placeholder.com/800x400/00BCD4/FFFFFF?text=Science',
    publishedAt: new Date('2024-12-18T07:30:00Z'),
    source: {
      name: 'The Guardian',
      biasRating: 'lean-left'
    }
  },
  {
    title: 'Education Reform Bill Advances in Legislature',
    description: 'Lawmakers move forward with comprehensive education reform package aimed at improving student outcomes and teacher support.',
    url: 'https://www.nytimes.com/education/2024/12/reform-bill-advances',
    imageUrl: 'https://via.placeholder.com/800x400/8BC34A/FFFFFF?text=Education',
    publishedAt: new Date('2024-12-18T07:00:00Z'),
    source: {
      name: 'The New York Times',
      biasRating: 'lean-left'
    }
  },
  {
    title: 'Corporate Earnings Season Shows Diverging Trends',
    description: 'Quarterly earnings reports reveal varied performance across sectors, with technology and healthcare leading growth.',
    url: 'https://www.wsj.com/business/earnings-season-trends-2024',
    imageUrl: 'https://via.placeholder.com/800x400/673AB7/FFFFFF?text=Business',
    publishedAt: new Date('2024-12-18T06:30:00Z'),
    source: {
      name: 'Wall Street Journal',
      biasRating: 'lean-right'
    }
  },
  {
    title: 'Energy Sector Investments Shift Toward Renewables',
    description: 'Major energy companies announce significant investments in renewable energy infrastructure as market dynamics evolve.',
    url: 'https://www.reuters.com/business/energy/renewable-investments-2024',
    imageUrl: 'https://via.placeholder.com/800x400/FFEB3B/333333?text=Energy',
    publishedAt: new Date('2024-12-18T06:00:00Z'),
    source: {
      name: 'Axios',
      biasRating: 'center'
    }
  },
  {
    title: 'Border Security Measures Debated in Congress',
    description: 'Congressional leaders engage in heated debate over proposed border security measures and immigration policy reforms.',
    url: 'https://www.foxnews.com/politics/border-security-debate-2024',
    imageUrl: 'https://via.placeholder.com/800x400/795548/FFFFFF?text=Politics',
    publishedAt: new Date('2024-12-18T05:30:00Z'),
    source: {
      name: 'Fox News',
      biasRating: 'right'
    }
  }
];

/**
 * Returns mock articles with optional filtering
 */
export function getMockArticles(limit?: number): ParsedArticle[] {
  const articles = [...mockArticles];
  
  // Sort by published date, newest first
  articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  if (limit) {
    return articles.slice(0, limit);
  }
  
  return articles;
}

/**
 * Filters mock articles by source name
 */
export function getMockArticlesBySource(sourceName: string, limit?: number): ParsedArticle[] {
  const filtered = mockArticles.filter(
    (article) => article.source.name.toLowerCase() === sourceName.toLowerCase()
  );
  
  // Sort by published date, newest first
  filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  if (limit) {
    return filtered.slice(0, limit);
  }
  
  return filtered;
}
