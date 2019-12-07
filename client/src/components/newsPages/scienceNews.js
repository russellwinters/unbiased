import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import Footer from "../Footer";

export default function ScienceNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      // axios.get("/science/api").then(response => {
      axios
        .get("https://floating-springs-05247.herokuapp.com/science/api")
        .then(response => {
          setArticles(response.data);
          setCurrentArticles(response.data[0]);
        });
    }
  });

  //Constant for infinite scroll
  const idSelector = document.querySelector("#articleHeight");
  //Listening if height of the element is less than the window height plus distance we've scrolled
  window.onscroll = function(ev) {
    if (window.innerHeight + window.scrollY >= idSelector.offsetHeight) {
      // console.log(true);
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
      <>
        <section className="main-page">
          <div className="category-description">
            <h3 className="category-description__title">Science</h3>
            <p className="category-description__content">
              Science is a section that should have zero bias. With that in
              mind, the selection of sources was picked based on a selection of
              medical, nature, and scientific news sources. Most of these
              outlets come in the form of Journals or Magazines!
            </p>
          </div>
          <div id="articleHeight" className="category-content">
            <MapArticles articles={currentArticles} />
          </div>
        </section>
        <Footer />
      </>
    );
}
