'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ParsedArticle, BiasRating } from '@/lib/news/rss-parser';
import ArticleCard from './components/ArticleCard';
import BiasDistribution from './components/BiasDistribution';
import Pagination from './components/Pagination';
import FilterPanel from './components/FilterPanel';
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

interface Source {
  id: string;
  name: string;
  biasRating: BiasRating;
  reliability: string;
}

interface SourcesApiResponse {
  sources: Source[];
  count: number;
  timestamp: string;
}

const PAGINATION_LIMIT = 50;

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [availableSources, setAvailableSources] = useState<Source[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [selectedBiases, setSelectedBiases] = useState<BiasRating[]>([]);

  // Fetch available sources on mount
  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch('/api/sources');
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        const data: SourcesApiResponse = await response.json();
        setAvailableSources(data.sources);
      } catch (err) {
        console.error('Error fetching sources:', err);
      }
    }

    fetchSources();
  }, []);

  // Initialize filter state from URL on mount
  useEffect(() => {
    const sourceIdsParam = searchParams.get('sourceIds');
    const biasParam = searchParams.get('bias');
    const pageParam = searchParams.get('page');

    if (sourceIdsParam) {
      const sourceIds = sourceIdsParam.split(',').filter(Boolean);
      setSelectedSourceIds(sourceIds);
    }

    if (biasParam) {
      const biases = biasParam.split(',').filter(Boolean) as BiasRating[];
      setSelectedBiases(biases);
    }

    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: PAGINATION_LIMIT.toString(),
        });

        if (selectedSourceIds.length > 0) {
          params.set('sourceIds', selectedSourceIds.join(','));
        }

        if (selectedBiases.length > 0) {
          params.set('bias', selectedBiases.join(','));
        }

        const response = await fetch(`/api/articles?${params.toString()}`);

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
  }, [currentPage, selectedSourceIds, selectedBiases]);

  // Update URL when filters change
  const updateURL = (sourceIds: string[], biases: BiasRating[], page: number) => {
    const params = new URLSearchParams();

    if (sourceIds.length > 0) {
      params.set('sourceIds', sourceIds.join(','));
    }

    if (biases.length > 0) {
      params.set('bias', biases.join(','));
    }

    if (page > 1) {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const handleSourceChange = (sourceIds: string[]) => {
    setSelectedSourceIds(sourceIds);
    setCurrentPage(1); // Reset to page 1 when filters change
    updateURL(sourceIds, selectedBiases, 1);
  };

  const handleBiasChange = (biases: BiasRating[]) => {
    setSelectedBiases(biases);
    setCurrentPage(1); // Reset to page 1 when filters change
    updateURL(selectedSourceIds, biases, 1);
  };

  const handleClearFilters = () => {
    setSelectedSourceIds([]);
    setSelectedBiases([]);
    setCurrentPage(1);
    router.push('/', { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(selectedSourceIds, selectedBiases, page);
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
          <FilterPanel
            availableSources={availableSources}
            selectedSourceIds={selectedSourceIds}
            selectedBiases={selectedBiases}
            onSourceChange={handleSourceChange}
            onBiasChange={handleBiasChange}
            onClearFilters={handleClearFilters}
          />
          <BiasDistribution articles={articles} />
        </aside>

        <section className={styles.main}>
          {articles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No articles available at this time.</p>
              {(selectedSourceIds.length > 0 || selectedBiases.length > 0) && (
                <p className={styles.emptyStateHint}>
                  Try adjusting your filters to see more articles.
                </p>
              )}
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

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Loading articles...</div>
      </div>
    }>
      <ArticlesPageContent />
    </Suspense>
  );
}

function getCurrentPageStart(currentPage: number, pageLimit: number) {
  return (currentPage - 1) * pageLimit + 1;
}

function getCurrentPageEnd(currentPage: number, pageLimit: number, totalCount: number) {
  return Math.min(currentPage * pageLimit, totalCount);
}