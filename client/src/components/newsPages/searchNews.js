import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import PageCounter from "../PageCounter";
import axios from "axios";
import SearchIcon from "../../assets/search-icon.svg";

export default function SearchNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filterSearch = event => {
    event.preventDefault();
    event.persist();
    axios.get("http://localhost:5000/search").then(response => {
      const searchArticles = response.data;
      const formInput = event.target.search.value;
      console.log(formInput);
      const returnArr = searchArticles.filter(
        obj =>
          obj.title.toLowerCase().includes(formInput.toLowerCase()) ||
          obj.description.toLowerCase().includes(formInput.toLowerCase())
      );
      console.log(returnArr);
      setArticles(returnArr);
    });
  };

  const NoResult = (
    <div>
      <h1>Oops...</h1>
      <span>
        There's currently no active search. Enter to the searchbar to filter
        through articles!
      </span>
    </div>
  );

  const searchField = (
    <div className="search">
      <form className="search-container" onSubmit={filterSearch}>
        <img alt="search" className="search-container__icon" src={SearchIcon} />
        <input
          name="search"
          className="search-container__input"
          type="text"
          placeholder="Search"
        />
      </form>
    </div>
  );

  if (articles === null) {
    return (
      <>
        {searchField}
        {NoResult}
      </>
    );
  } else {
    return (
      <>
        {searchField}
        <section className="main-page">
          <MapArticles articles={articles} />
          <PageCounter setPage={setCurrentPage} />
        </section>
      </>
    );
  }
}
