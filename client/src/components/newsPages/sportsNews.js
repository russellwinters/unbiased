import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";

export default function SportsNews() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    console.log(articles.length);
    if (articles.length === 0) {
      axios.get("http://localhost:5000/sports").then(response => {
        console.log(response.data);
        setArticles(response.data);
      });
    }
  });
  return <>{<MapArticles articles={articles} />}</>;
}
