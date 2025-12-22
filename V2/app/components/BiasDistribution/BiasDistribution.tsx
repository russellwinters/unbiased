import { ParsedArticle, BiasRating } from '@/lib/news/rss-parser';
import styles from './BiasDistribution.module.scss';

interface BiasDistributionProps {
  articles: ParsedArticle[];
}

interface BiasCount {
  biasRating: BiasRating;
  count: number;
  percentage: number;
  label: string;
  color: string;
}

const biasConfig: Record<BiasRating, { label: string; color: string }> = {
  'left': { label: 'Left', color: '#1e40af' },
  'lean-left': { label: 'Lean Left', color: '#3b82f6' },
  'center': { label: 'Center', color: '#8b5cf6' },
  'lean-right': { label: 'Lean Right', color: '#f97316' },
  'right': { label: 'Right', color: '#dc2626' },
};

export default function BiasDistribution({ articles }: BiasDistributionProps) {
  // Count articles by bias rating
  const biasCounts: Record<BiasRating, number> = {
    'left': 0,
    'lean-left': 0,
    'center': 0,
    'lean-right': 0,
    'right': 0,
  };

  articles.forEach((article) => {
    const bias = article.source.biasRating as BiasRating;
    if (bias in biasCounts) {
      biasCounts[bias]++;
    }
  });

  const totalArticles = articles.length;
  const uniqueSourcesCount = new Set(articles.map(a => a.source.name)).size;
  
  const biasData: BiasCount[] = Object.entries(biasCounts).map(([biasRating, count]) => ({
    biasRating: biasRating as BiasRating,
    count,
    percentage: totalArticles > 0 ? (count / totalArticles) * 100 : 0,
    label: biasConfig[biasRating as BiasRating].label,
    color: biasConfig[biasRating as BiasRating].color,
  }));

  return (
    <div className={styles.biasDistribution}>
      <h3 className={styles.title}>Bias Distribution</h3>
      <p className={styles.subtitle}>
        Showing {totalArticles} articles from {uniqueSourcesCount} sources
      </p>
      
      <div className={styles.chart}>
        {biasData.map((data) => (
          data.count > 0 && (
            <div 
              key={data.biasRating}
              className={styles.bar}
              style={{ 
                width: `${data.percentage}%`,
                backgroundColor: data.color 
              }}
              title={`${data.label}: ${data.count} articles (${data.percentage.toFixed(1)}%)`}
            />
          )
        ))}
      </div>
      
      <div className={styles.legend}>
        {biasData.map((data) => (
          <div key={data.biasRating} className={styles.legendItem}>
            <div 
              className={styles.legendColor}
              style={{ backgroundColor: data.color }}
            />
            <span className={styles.legendLabel}>{data.label}</span>
            <span className={styles.legendCount}>
              {data.count} ({data.percentage.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
