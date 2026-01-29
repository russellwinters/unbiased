'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
          UNBIASED
        </Link>

        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link
            href="/about"
            className={`${styles.navLink} ${isActivePage('/about') ? styles.navLinkActive : ''}`}
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link
            href="/"
            className={`${styles.navLink} ${isActivePage('/') ? styles.navLinkActive : ''}`}
            onClick={closeMobileMenu}
          >
            News
          </Link>
        </nav>

        <button
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? '×' : '☰'}
        </button>
      </div>
    </header>
  );
}
