import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Unbiased V2</h1>
          <p className={styles.subtitle}>
            A modern news aggregator providing multi-perspective coverage
            with bias analysis
          </p>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Multi-Source</h3>
            <p className={styles.featureDescription}>
              Aggregates news from sources across the political spectrum
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Bias Aware</h3>
            <p className={styles.featureDescription}>
              Transparent bias ratings help identify perspective
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Story Clustering</h3>
            <p className={styles.featureDescription}>
              See how different sources cover the same story
            </p>
          </div>
        </div>
        
        <div className={styles.ctas}>
          <button className={`${styles.button} ${styles.primary}`}>
            Browse News
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Learn More
          </button>
        </div>
        
        <div className={styles.note}>
          <p>
            <strong>Note:</strong> This is V2 of Unbiased - a complete rewrite
            with modern architecture. V1 is preserved in the V1 directory.
          </p>
        </div>
      </main>
    </div>
  );
}
