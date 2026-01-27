import styles from './styles.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageIndicators = () => {
    const pages: (number | string)[] = [];
    const itemMaxCount = 7;

    if (totalPages <= itemMaxCount) {
      pushAllPages(pages, totalPages);
    } else {
      pages.push(1);
      maybePushPageSeparatorInit(pages, currentPage);

      const { start, end } = getSurroundingPageRange(currentPage, totalPages);
      pushRange(pages, start, end);

      maybePushPageSeparatorClose(pages, currentPage, totalPages);
      maybePushFinalPage(pages, totalPages);
    }

    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        className={styles.button}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className={styles.pages}>
        {getPageIndicators().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={`page-${page}`}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              {page}
            </span>
          )
        ))}
      </div>

      <button
        className={styles.button}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}

function pushAllPages(pages: (number | string)[], totalPages: number) {
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
}

function maybePushPageSeparatorInit(pages: (number | string)[], currentPage: number) {
  if (currentPage > 3) {
    pages.push('...');
  }
}

function maybePushPageSeparatorClose(pages: (number | string)[], currentPage: number, totalPages: number) {
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
}

function pushRange(pages: (number | string)[], start: number, end: number) {
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
}

function getSurroundingPageRange(currentPage: number, totalPages: number) {
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  return { start, end };
}

function maybePushFinalPage(pages: (number | string)[], totalPages: number) {
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }
}

