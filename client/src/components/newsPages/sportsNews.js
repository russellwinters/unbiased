import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";

export default function SportsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/sports").then(response => {
        setArticles(response.data);
        setCurrentArticles(response.data[0]);
      });
    }
  });

  window.onscroll = function(ev) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (currentPage < 5 && articles !== null) {
        setCurrentArticles([...currentArticles, ...articles[currentPage + 1]]);
        setCurrentPage(currentPage + 1);
      }
    }
  };

  if (articles === null) {
    return <></>;
  } else
    return (
      <section className="main-page">
        <div className="category-description">
          <h3 className="category-description__title">Sports</h3>
          <p className="category-description__content">
            Sports are naturally unbiased, and that's how we like it! With that
            being said, the feed below pulls mostly from ESPN and
            BleacherReport, but also includes articles from NFL News and NHL
            News.
          </p>
        </div>
        <MapArticles articles={currentArticles} />
      </section>
    );
}
