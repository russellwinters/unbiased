import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import PageCounter from "../PageCounter";
import axios from "axios";

export default function ScienceNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (articles === null) {
      axios.get("http://localhost:5000/science").then(response => {
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
          <h3>Science</h3>
          <p>
            Science is a section that should have zero bias. With that in mind,
            the selection of sources was picked based on a selection of Medical,
            Nature, and "Science" news sources. Most of these outlets come in
            the form of Journals or Magazines!
          </p>
        </div>
        <MapArticles articles={articles[currentPage]} />
        <PageCounter setPage={setCurrentPage} />
      </section>
    );
}
