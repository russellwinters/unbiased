'use client';

import { useEffect, useState } from 'react';
import { ParsedArticle } from '@/lib/news/rss-parser';
import ArticleCard from '../components/ArticleCard';
import BiasDistribution from '../components/BiasDistribution';
import styles from './page.module.scss';

interface ApiResponse {
  articles: ParsedArticle[];
  count: number;
  sources: string[];
  usedMockData: boolean;
  errors: string[];
  timestamp: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/articles');
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data: ApiResponse = await response.json();
        
        // Convert publishedAt strings back to Date objects with validation
        const articlesWithDates = data.articles.map(article => {
          const publishedAt = new Date(article.publishedAt);
          // Fallback to current date if invalid
          const validDate = isNaN(publishedAt.getTime()) ? new Date() : publishedAt;
          
          return {
            ...article,
            publishedAt: validDate
          };
        });
        
        setArticles(articlesWithDates);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Error loading articles: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>News Articles</h1>
          <p className={styles.subtitle}>
            Multi-perspective news coverage from across the political spectrum
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <BiasDistribution articles={articles} />
        </aside>

        <main className={styles.main}>
          {articles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No articles available at this time.</p>
            </div>
          ) : (
            <div className={styles.articleGrid}>
              {articles.map((article, index) => (
                <ArticleCard key={`${article.url}-${index}`} article={article} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
