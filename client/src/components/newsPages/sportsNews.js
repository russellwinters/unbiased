import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import PageCounter from "../PageCounter";
import axios from "axios";

export default function SportsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/sports").then(response => {
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
          <h3>Sports</h3>
          <p>
            Sports are naturally unbiased, and that's how we like it! With that
            being said, the feed below pulls mostly from ESPN and
            BleacherReport, but also includes articles from NFL News and NHL
            News.
          </p>
        </div>
        <MapArticles articles={articles[currentPage]} />
        <PageCounter setPage={setCurrentPage} />
      </section>
    );
}
