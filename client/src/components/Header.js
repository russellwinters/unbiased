import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [nav, setNav] = useState(false);
  const navbar = (
    <>
      <button
        onClick={() => {
          setNav(false);
        }}
      >
        |||
      </button>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/sports">Sports</Link>
        <Link to="/science">Science</Link>
        <Link to="/politics">Politics</Link>
        <Link to="/business">Business</Link>
      </nav>
    </>
  );

  const navbutton = (
    <button
      onClick={() => {
        setNav(true);
      }}
    >
      |||
    </button>
  );

  console.log(nav);
  return (
    <div>
      <h1>Unbiased</h1>
      {nav === true ? navbar : navbutton}
    </div>
  );
}
