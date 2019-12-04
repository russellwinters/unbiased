import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";

export default function PoliticsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/politics").then(response => {
        console.log(response.data);
        setArticles(response.data);
        setCurrentArticles(response.data[0]);
      });
    }
  });

  window.onscroll = function(ev) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (currentPage < 5) {
        setCurrentPage(currentPage + 1);
        setCurrentArticles([...currentArticles, ...articles[currentPage]]);
      }
    }
  };

  if (articles === null) {
    return <h1>Nothing</h1>;
  } else
    return (
      <section className="main-page">
        <div className="category-description">
          <h3 className="category-description__title">Politics</h3>
          <p className="category-description__content">
            This is the category that is at the heart of Unbiased. To give the
            most credibility to the articles, the sources were filtered based on
            multiple charts that designated these sources to have the highest
            rating for "original fact reporting", with as little opinion
            reporting as possible. To remain impartial, there is a source or two
            that are considered more persuasive than the others, but popularity
            in American society pushed them in because a significant purpose of
            Unbiased is to allow readers access to common content. There is no
            direct intend to push political ideology, just an attempt to share
            views that are commonly held OR read.
          </p>
        </div>
        <MapArticles articles={currentArticles} />
      </section>
    );
}
