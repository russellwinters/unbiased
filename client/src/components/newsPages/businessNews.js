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
      <>
        {/* <MapArticles articles={articles[currentPage]} /> */}
        <PageCounter setPage={setCurrentPage} />
      </>
    );
}
