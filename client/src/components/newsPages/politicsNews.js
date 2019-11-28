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
      <>
        <MapArticles articles={articles[currentPage]} />
        <PageCounter setPage={setCurrentPage} />
      </>
    );
}
