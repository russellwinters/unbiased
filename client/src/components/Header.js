import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [nav, setNav] = useState(false);
  const navbar = (
    <>
      <button
        className="header-button"
        onClick={() => {
          setNav(false);
        }}
      >
        |||
      </button>
      <nav className="header-nav">
        <Link className="header-nav__link" to="/">
          Home
        </Link>
        <Link className="header-nav__link" to="/sports">
          Sports
        </Link>
        <Link className="header-nav__link" to="/science">
          Science
        </Link>
        <Link className="header-nav__link" to="/politics">
          Politics
        </Link>
        <Link className="header-nav__link" to="/business">
          Business
        </Link>
      </nav>
    </>
  );

  const navbutton = (
    <button
      className="header-button"
      onClick={() => {
        setNav(true);
      }}
    >
      |||
    </button>
  );

  console.log(nav);
  return (
    <header className="header">
      <h1 className="header-title">Unbiased</h1>
      {nav === true ? navbar : navbutton}
    </header>
  );
}
