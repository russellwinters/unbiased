import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";

export default function ScienceNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/science").then(response => {
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
          <h3 className="category-description__title">Science</h3>
          <p className="category-description__content">
            Science is a section that should have zero bias. With that in mind,
            the selection of sources was picked based on a selection of medical,
            nature, and scientific news sources. Most of these outlets come in
            the form of Journals or Magazines!
          </p>
        </div>
        <div className="category-content">
          <MapArticles articles={currentArticles} />
        </div>
      </section>
    );
}
