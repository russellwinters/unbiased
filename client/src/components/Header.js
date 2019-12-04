import React from "react";
import { Link } from "react-router-dom";
import SearchIcon from "../assets/search-icon.svg";

export default function Header() {
  const navLinks = (
    <nav className="header-nav">
      <Link className="header-nav-link" to="/sports">
        Sports
      </Link>
      <Link className="header-nav-link" to="/science">
        Science
      </Link>
      <Link className="header-nav-link" to="/politics">
        Politics
      </Link>
      <Link className="header-nav-link" to="/business">
        Business
      </Link>
    </nav>
  );

  return (
    <header className="header">
      <div className="header-main">
        <Link className="header-main__title" to="/">
          <h1>Unbiased</h1>
        </Link>
        <Link className="header-main__search" to="/search">
          <img
            alt="search"
            className="header-main__search-icon"
            src={SearchIcon}
          />
        </Link>
      </div>
      {navLinks}
    </header>
  );
}
