import { BiasRating } from './news/rss-parser';

export const BIAS_LABELS: Record<BiasRating, string> = {
  'left': 'Left',
  'lean-left': 'Lean Left',
  'center': 'Center',
  'lean-right': 'Lean Right',
  'right': 'Right',
};

export const BIAS_COLORS: Record<BiasRating, string> = {
  'left': '#1e40af',
  'lean-left': '#3b82f6',
  'center': '#8b5cf6',
  'lean-right': '#f97316',
  'right': '#dc2626',
};

export const BIAS_CONFIG: Record<BiasRating, { label: string; color: string }> = {
  'left': { label: BIAS_LABELS.left, color: BIAS_COLORS.left },
  'lean-left': { label: BIAS_LABELS['lean-left'], color: BIAS_COLORS['lean-left'] },
  'center': { label: BIAS_LABELS.center, color: BIAS_COLORS.center },
  'lean-right': { label: BIAS_LABELS['lean-right'], color: BIAS_COLORS['lean-right'] },
  'right': { label: BIAS_LABELS.right, color: BIAS_COLORS.right },
};
