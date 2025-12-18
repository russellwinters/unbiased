import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer-text">
        Powered By:{" "}
        <a
          className="footer-text__link"
          href="https://newsapi.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          News API
        </a>
      </span>
    </footer>
  );
}
