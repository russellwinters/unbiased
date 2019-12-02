import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import SearchIcon from "../../assets/search-icon.svg";

export default function SearchNews() {
  const [articles, setArticles] = useState(null);

  const NoResult = (
    <div>
      <h1>Oops...</h1>
      <span>
        There's currently no active search. Enter to the searchbar to filter
        through articles!
      </span>
    </div>
  );
  return (
    <div className="search">
      {/* <h1 className="search-heading">Search:</h1> */}
      <div className="search-container">
        <img alt="search" className="search-container__icon" src={SearchIcon} />
        <input
          className="search-container__input"
          type="text"
          placeholder="Search"
        ></input>
      </div>
    </div>
  );
}
