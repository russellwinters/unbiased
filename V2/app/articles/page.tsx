'use client';

import { useEffect, useState } from 'react';
import { ParsedArticle } from '@/lib/news/rss-parser';
import { getMockArticles } from '@/lib/news/mock-data';
import ArticleCard from '../components/ArticleCard';
import BiasDistribution from '../components/BiasDistribution';
import styles from './page.module.scss';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, use mock data
    // TODO: Replace with API call when database is set up
    const mockArticles = getMockArticles();
    setArticles(mockArticles);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading articles...</div>
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
