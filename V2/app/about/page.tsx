import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'About Unbiased - Multi-Perspective News',
  description: 'Learn about Unbiased\'s mission to break echo chambers through multi-perspective news coverage from across the political spectrum.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Placeholder for future header component */}
      <div className={styles.headerPlaceholder} />
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>About Unbiased</h1>
          <p className={styles.heroSubtitle}>
            News from all sides, no echo chambers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Breaking Out of Echo Chambers</h2>
          <p className={styles.sectionText}>
            In today's media landscape, it's easier than ever to consume news that only confirms what we already believe. 
            Algorithms feed us content that matches our preferences, and we naturally gravitate toward sources that align 
            with our views. This creates echo chambers—isolated information bubbles that reinforce our biases and deepen 
            political divisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Multi-Perspective News Coverage</h2>
          <p className={styles.sectionText}>
            Unbiased takes a different approach. Instead of filtering the news to match your preferences, we show you 
            how <em>everyone</em> is covering the stories that matter. Our platform aggregates news from across the 
            political spectrum—left, center, and right—giving you a comprehensive view of current events.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Transparent, Comprehensive, Unbiased</h2>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <strong>Diverse Sources:</strong> We pull articles from news outlets with varying perspectives and bias ratings
            </li>
            <li className={styles.featureItem}>
              <strong>Bias Transparency:</strong> Each source is clearly labeled so you know where it falls on the political spectrum
            </li>
            <li className={styles.featureItem}>
              <strong>Story Clustering:</strong> See how different outlets cover the same story (coming soon)
            </li>
            <li className={styles.featureItem}>
              <strong>No Algorithms:</strong> We don't hide or prioritize content based on your preferences
            </li>
          </ul>
          <p className={styles.sectionText}>
            Our goal isn't to tell you what to think—it's to give you the full picture so you can think for yourself.
          </p>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Explore the News</h2>
          <Link href="/" className={styles.ctaButton}>
            View Latest Articles →
          </Link>
        </section>
      </main>
    </div>
  );
}
