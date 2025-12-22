import { ParsedArticle } from '@/lib/news/rss-parser';
import BiasIndicator from '../BiasIndicator';
import styles from './ArticleCard.module.scss';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  article: ParsedArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(article.publishedAt, { addSuffix: true });

  return (
    <article className={styles.articleCard}>
      {article.imageUrl && (
        <div className={styles.imageContainer}>
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className={styles.image}
          />
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.sourceInfo}>
            <span className={styles.sourceName}>{article.source.name}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.timeAgo}>{timeAgo}</span>
          </div>
          <BiasIndicator biasRating={article.source.biasRating as any} size="small" />
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
