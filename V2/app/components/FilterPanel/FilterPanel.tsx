'use client';

import { useState } from 'react';
import { BiasRating } from '@/lib/news/rss-parser';
import { BIAS_CONFIG } from '@/lib/constants';
import styles from './FilterPanel.module.scss';

interface Source {
  id: string;
  name: string;
  biasRating: BiasRating;
}

interface FilterPanelProps {
  availableSources: Source[];
  selectedSourceIds: string[];
  selectedBiases: BiasRating[];
  onSourceChange: (sourceIds: string[]) => void;
  onBiasChange: (biases: BiasRating[]) => void;
  onClearFilters: () => void;
  articleCounts?: {
    sources: Record<string, number>;
    biases: Record<BiasRating, number>;
  };
}

export default function FilterPanel({
  availableSources,
  selectedSourceIds,
  selectedBiases,
  onSourceChange,
  onBiasChange,
  onClearFilters,
  articleCounts,
}: FilterPanelProps) {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isBiasExpanded, setIsBiasExpanded] = useState(true);

  const handleSourceToggle = (sourceId: string) => {
    if (selectedSourceIds.includes(sourceId)) {
      onSourceChange(selectedSourceIds.filter(id => id !== sourceId));
    } else {
      onSourceChange([...selectedSourceIds, sourceId]);
    }
  };

  const handleBiasToggle = (bias: BiasRating) => {
    if (selectedBiases.includes(bias)) {
      onBiasChange(selectedBiases.filter(b => b !== bias));
    } else {
      onBiasChange([...selectedBiases, bias]);
    }
  };

  const activeFilterCount = selectedSourceIds.length + selectedBiases.length;

  // Group sources by bias rating for better organization
  const sourcesByBias = availableSources.reduce((acc, source) => {
    if (!acc[source.biasRating]) {
      acc[source.biasRating] = [];
    }
    acc[source.biasRating].push(source);
    return acc;
  }, {} as Record<BiasRating, Source[]>);

  // Sort sources alphabetically within each bias group
  Object.keys(sourcesByBias).forEach((bias) => {
    sourcesByBias[bias as BiasRating].sort((a, b) => a.name.localeCompare(b.name));
  });

  const biasOrder: BiasRating[] = ['left', 'lean-left', 'center', 'lean-right', 'right'];

  return (
    <div className={styles.filterPanel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Filters</h3>
          {activeFilterCount > 0 && (
            <span className={styles.badge}>{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            className={styles.clearButton}
            onClick={onClearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Bias Filter Section */}
      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => setIsBiasExpanded(!isBiasExpanded)}
        >
          <span className={styles.sectionTitle}>Bias Rating</span>
          <span className={`${styles.expandIcon} ${isBiasExpanded ? styles.expanded : ''}`}>
            ▼
          </span>
        </button>

        {isBiasExpanded && (
          <div className={styles.filterOptions}>
            {biasOrder.map((bias) => {
              const config = BIAS_CONFIG[bias];
              const count = articleCounts?.biases[bias];
              const isSelected = selectedBiases.includes(bias);

              return (
                <label
                  key={bias}
                  className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleBiasToggle(bias)}
                    className={styles.checkbox}
                  />
                  <div
                    className={styles.biasIndicator}
                    style={{ backgroundColor: config.color }}
                  />
                  <span className={styles.filterLabel}>{config.label}</span>
                  {count !== undefined && (
                    <span className={styles.count}>({count})</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Source Filter Section */}
      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
        >
          <span className={styles.sectionTitle}>Source</span>
          <span className={`${styles.expandIcon} ${isSourcesExpanded ? styles.expanded : ''}`}>
            ▼
          </span>
        </button>

        {isSourcesExpanded && (
          <div className={styles.filterOptions}>
            {biasOrder.map((bias) => {
              const sources = sourcesByBias[bias] || [];
              if (sources.length === 0) return null;

              return (
                <div key={bias} className={styles.sourceGroup}>
                  <div className={styles.biasGroupHeader}>
                    <div
                      className={styles.biasGroupIndicator}
                      style={{ backgroundColor: BIAS_CONFIG[bias].color }}
                    />
                    <span className={styles.biasGroupLabel}>
                      {BIAS_CONFIG[bias].label}
                    </span>
                  </div>
                  {sources.map((source) => {
                    const count = articleCounts?.sources[source.id];
                    const isSelected = selectedSourceIds.includes(source.id);

                    return (
                      <label
                        key={source.id}
                        className={`${styles.filterOption} ${styles.sourceOption} ${isSelected ? styles.selected : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSourceToggle(source.id)}
                          className={styles.checkbox}
                        />
                        <span className={styles.filterLabel}>{source.name}</span>
                        {count !== undefined && (
                          <span className={styles.count}>({count})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
