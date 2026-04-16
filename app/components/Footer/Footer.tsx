import styles from './Footer.module.scss';

const BUYMEACOFFEE_USERNAME = 'russellwinters'; // Set your Buy Me a Coffee username here to enable the link

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span className={styles.credit}>
          Made with ❤️ in Squamish, BC &mdash; {year}
        </span>
        {BUYMEACOFFEE_USERNAME && (
          <a
            href={`https://www.buymeacoffee.com/${BUYMEACOFFEE_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.coffee}
          >
            ☕ Buy me a coffee
          </a>
        )}
      </div>
    </footer>
  );
}
