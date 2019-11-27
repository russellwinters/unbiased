import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <h1>Unbiased</h1>
      <nav>
        <Link to="/sports">Sports</Link>
        <Link to="/science">Science</Link>
        <Link to="/politics">Politics</Link>
        <Link to="/business">Business</Link>
        <Link to="/">Home</Link>
      </nav>
    </div>
  );
}
