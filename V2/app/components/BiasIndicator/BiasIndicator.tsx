import styles from './BiasIndicator.module.scss';

export type BiasRating = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';

interface BiasIndicatorProps {
  biasRating: BiasRating;
  size?: 'small' | 'medium' | 'large';
}

const biasLabels: Record<BiasRating, string> = {
  'left': 'Left',
  'lean-left': 'Lean Left',
  'center': 'Center',
  'lean-right': 'Lean Right',
  'right': 'Right',
};

export default function BiasIndicator({ biasRating, size = 'medium' }: BiasIndicatorProps) {
  return (
    <span 
      className={`${styles.biasIndicator} ${styles[biasRating]} ${styles[size]}`}
      title={`Bias Rating: ${biasLabels[biasRating]}`}
    >
      {biasLabels[biasRating]}
    </span>
  );
}
