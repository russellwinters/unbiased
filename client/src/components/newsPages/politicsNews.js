import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import PageCounter from "../PageCounter";
import axios from "axios";

export default function PoliticsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/politics").then(response => {
        console.log(response.data);
        setArticles(response.data);
      });
    }
  });

  if (articles === null) {
    return <h1>Nothing</h1>;
  } else
    return (
      <section className="main-page">
        <div>
          <h3>Politics</h3>
          <p>
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
        <MapArticles articles={articles[currentPage]} />
        <PageCounter setPage={setCurrentPage} />
      </section>
    );
}
