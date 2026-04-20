import { ParsedArticle } from '@/lib/news/rss-parser';
import BiasIndicator from '../BiasIndicator';
import styles from './ArticleCard.module.scss';
import { formatDistanceToNow } from 'date-fns';
import { BIAS_COLORS } from '@/lib/constants';

interface ArticleCardProps {
  article: ParsedArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(article.publishedAt, { addSuffix: true });
  const placeholderColor = BIAS_COLORS[article.source.biasRating] ?? '#6b7280';

  return (
    <article className={styles.articleCard}>
      <div className={styles.imageContainer}>
        {article.imageUrl ? (
          <img
            src={article.imageUrl || ""}
            alt={article.title}
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ backgroundColor: placeholderColor }}
          >
            <span className={styles.placeholderInitial}>{article.source.name}</span>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.sourceInfo}>
            <span className={styles.sourceName}>{article.source.name}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.timeAgo}>{timeAgo}</span>
          </div>
          <BiasIndicator biasRating={article.source.biasRating} size="small" />
        </div>
        
        <h2 className={styles.title}>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h2>
        
        {article.description && (
          <p className={styles.description}>{article.description}</p>
        )}
        
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.readMore}
        >
          Read full article →
        </a>
      </div>
    </article>
  );
}
