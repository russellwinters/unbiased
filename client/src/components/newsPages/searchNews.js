import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import SearchIcon from "../../assets/search-icon.svg";

export default function SearchNews() {
  const [articles, setArticles] = useState(null);

  // useEffect(() => {
  //   if (articles === null) {
  //     axios.get("http://localhost:5000/search").then(response => {
  //       const searchArticles = response.data;
  //       console.log(searchArticles);
  //       const returnArr = searchArticles.filter(
  //         obj =>
  //           obj.title.toLowerCase().includes("trump") ||
  //           obj.description.toLowerCase().includes("trump")
  //       );
  //       console.log(returnArr);
  //     });
  //   }
  // });

  const filterSearch = event => {
    event.preventDefault();
    event.persist();
    axios.get("http://localhost:5000/search").then(response => {
      const searchArticles = response.data;
      // console.log(searchArticles);
      const formInput = event.target.search.value;
      console.log(formInput);
      const returnArr = searchArticles.filter(
        obj =>
          obj.title.toLowerCase().includes(formInput.toLowerCase()) ||
          obj.description.toLowerCase().includes(formInput.toLowerCase())
      );
      console.log(returnArr);
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
  return (
    <div className="search">
      {/* <h1 className="search-heading">Search:</h1> */}
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
}
