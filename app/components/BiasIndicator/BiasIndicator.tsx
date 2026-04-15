import { BiasRating } from '@/lib/news/rss-parser';
import { BIAS_LABELS } from '@/lib/constants';
import styles from './BiasIndicator.module.scss';

interface BiasIndicatorProps {
  biasRating: BiasRating;
  size?: 'small' | 'medium' | 'large';
}

export default function BiasIndicator({ biasRating, size = 'medium' }: BiasIndicatorProps) {
  return (
    <span 
      className={`${styles.biasIndicator} ${styles[biasRating]} ${styles[size]}`}
      title={`Bias Rating: ${BIAS_LABELS[biasRating]}`}
    >
      {BIAS_LABELS[biasRating]}
    </span>
  );
}
