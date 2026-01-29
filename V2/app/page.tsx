'use client';

import { useEffect, useState } from 'react';
import { ParsedArticle } from '@/lib/news/rss-parser';
import ArticleCard from './components/ArticleCard';
import BiasDistribution from './components/BiasDistribution';
import Pagination from './components/Pagination';
import styles from './page.module.scss';

interface ApiResponse {
  articles: ParsedArticle[];
  count: number;
  totalCount: number;
  page: number;
  totalPages: number;
  sources: string[];
  usedMockData: boolean;
  errors: string[];
  timestamp: string;
}

const PAGINATION_LIMIT = 50;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/articles?page=${currentPage}&limit=${PAGINATION_LIMIT}`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data: ApiResponse = await response.json();


        const articlesWithDates = data.articles.map(article => {
          const publishedAt = new Date(article.publishedAt);
          const validDate = isNaN(publishedAt.getTime()) ? new Date() : publishedAt; // TODO: consider if this is necessary??

          return {
            ...article,
            publishedAt: validDate
          };
        });

        setArticles(articlesWithDates);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          {totalCount > 0 && (
            <p className={styles.articleCount}>
              Showing {getCurrentPageStart(currentPage, PAGINATION_LIMIT)}-{getCurrentPageEnd(currentPage, PAGINATION_LIMIT, totalCount)} of {totalCount} articles
            </p>
          )}
        </div>
      </header>

      <main className={styles.content}>
        <aside className={styles.sidebar}>
          <BiasDistribution articles={articles} />
        </aside>

        <section className={styles.main}>
          {articles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No articles available at this time.</p>
            </div>
          ) : (
            <>
              <div className={styles.articleGrid}>
                {articles.map((article, index) => (
                  <ArticleCard key={`${article.url}-${index}`} article={article} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </main>
    </div >
  );
}

function getCurrentPageStart(currentPage: number, pageLimit: number) {
  return (currentPage - 1) * pageLimit + 1;
}

function getCurrentPageEnd(currentPage: number, pageLimit: number, totalCount: number) {
  return Math.min(currentPage * pageLimit, totalCount);
}