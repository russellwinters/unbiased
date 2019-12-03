import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import PageCounter from "../PageCounter";
import axios from "axios";

export default function BusinessNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/business").then(response => {
        console.log(response.data);
        setArticles(response.data);
      });
    }
  });
  if (articles === null) {
    return <></>;
  } else
    return (
      <section className="main-page">
        <div>
          <h3>Business</h3>
          <p>
            The Business section of Unbiased is drawing from Fortune, Business
            Insider, and Reuters. Each source had it's content filtered based on
            a simply query for "business" articles - to be safe. These are
            sources that are quite reliable overall, therefore worth the input
            for there categories.
          </p>
        </div>
        <MapArticles articles={articles[currentPage]} />
        <PageCounter setPage={setCurrentPage} />
      </section>
    );
}
