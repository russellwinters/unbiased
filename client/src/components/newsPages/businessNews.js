import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";

export default function BusinessNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/business").then(response => {
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
          <h3 className="category-description__title">Business</h3>
          <p className="category-description__content">
            The Business section of Unbiased is drawing from Fortune, Business
            Insider, and Reuters. Each source had it's content filtered based on
            a simply query for "business" articles - to be safe. These are
            sources that are quite reliable overall, therefore worth the input
            for there categories.
          </p>
        </div>
        <MapArticles articles={currentArticles} />
      </section>
    );
}
