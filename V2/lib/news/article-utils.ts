/**
 * Utility functions for article processing
 * Shared between seed script and API endpoints
 */

/**
 * Maps bias rating to reliability score
 */
export function getReliability(biasRating: string): string {
  const reliabilityMap: Record<string, string> = {
    'left': 'mixed',
    'lean-left': 'high',
    'center': 'very-high',
    'lean-right': 'high',
    'right': 'mixed',
  };
  return reliabilityMap[biasRating] || 'mixed';
}

/**
 * Extracts domain from a URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown.com';
  }
}

/**
 * Common words to filter out when extracting keywords
 */
const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
  'its', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
]);

/**
 * Extracts keywords from title and description
 */
export function extractKeywords(title: string, description: string | null): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();

  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  const uniqueWords = [...new Set(words)]
    .filter(word => !COMMON_WORDS.has(word))
    .slice(0, 10);

  return uniqueWords;
}
