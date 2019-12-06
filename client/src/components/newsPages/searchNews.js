import React, { useState } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import SearchIcon from "../../assets/search-icon-b.svg";
import Footer from "../Footer";

export default function SearchNews() {
  const [articles, setArticles] = useState(null);

  const cancelCourse = () => {
    document.querySelector("#search-form").reset();
  };

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
      cancelCourse();
      window.getSelection().removeAllRanges();
    });
  };

  const NoResult = (
    <>
      <div className="search-status">
        <h1 className="search-status__heading">Oops!</h1>
        <span className="search-status__message">
          Nothing was found for that search...
        </span>
      </div>
      <div className="fixed-footer">
        <Footer />
      </div>
    </>
  );

  const PreSearch = (
    <>
      <div className="search-status">
        <h1 className="search-status__heading">Waiting...</h1>
        <span className="search-status__message">
          We're waiting for your search
        </span>
      </div>
      <div className="fixed-footer">
        <Footer />
      </div>
    </>
  );

  const searchField = (
    <div className="search">
      <form
        id="search-form"
        className="search-container"
        onSubmit={filterSearch}
      >
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
        <section className="search-page">
          {searchField}
          {PreSearch}
        </section>
      </>
    );
  } else if (articles.length === 0) {
    return (
      <>
        <section className="search-page">
          {searchField}
          {NoResult}
        </section>
      </>
    );
  } else {
    return (
      <>
        <section className="search-page">
          {searchField}
          <section className="main-page search-results">
            <MapArticles articles={articles} />
          </section>
        </section>

        <Footer />
      </>
    );
  }
}
