import { ParsedArticle, BiasRating } from '@/lib/news/rss-parser';
import { BIAS_CONFIG } from '@/lib/constants';
import { getUniqueSourceCount } from '@/lib/utils';
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

export default function BiasDistribution({ articles }: BiasDistributionProps) {
  const biasCounts = articles.reduce<Record<BiasRating, number>>((acc, article) => {
    const bias = article.source.biasRating;
    acc[bias] = (acc[bias] || 0) + 1;
    return acc;
  }, {
    'left': 0,
    'lean-left': 0,
    'center': 0,
    'lean-right': 0,
    'right': 0,
  });

  const totalArticles = articles.length;
  const uniqueSourcesCount = getUniqueSourceCount(articles);
  
  const biasData: BiasCount[] = (Object.entries(biasCounts) as [BiasRating, number][]).map(([biasRating, count]) => ({
    biasRating,
    count,
    percentage: totalArticles > 0 ? (count / totalArticles) * 100 : 0,
    label: BIAS_CONFIG[biasRating].label,
    color: BIAS_CONFIG[biasRating].color,
  }));

  const renderBar = (data: BiasCount) => (
    <div 
      key={data.biasRating}
      className={styles.bar}
      style={{ 
        width: `${data.percentage}%`,
        backgroundColor: data.color 
      }}
      title={`${data.label}: ${data.count} articles (${data.percentage.toFixed(1)}%)`}
    />
  );

  const renderLegendItem = (data: BiasCount) => (
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
  );

  return (
    <div className={styles.biasDistribution}>
      <h3 className={styles.title}>Bias Distribution</h3>
      <p className={styles.subtitle}>
        Showing {totalArticles} articles from {uniqueSourcesCount} sources
      </p>
      
      <div className={styles.chart}>
        {biasData.filter(data => data.count > 0).map(renderBar)}
      </div>
      
      <div className={styles.legend}>
        {biasData.map(renderLegendItem)}
      </div>
    </div>
  );
}
