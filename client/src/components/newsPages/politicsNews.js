import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import Footer from "../Footer";

export default function PoliticsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      // axios.get("/politics/api").then(response => {
      axios
        .get("https://floating-springs-05247.herokuapp.com/politics/api")
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

  const footerScroll = document.querySelector(".home-footer");
  var timer = null;
  window.addEventListener(
    "scroll",
    function() {
      if (timer !== null) {
        clearTimeout(timer);
        if (footerScroll) {
          footerScroll.style.bottom = "-100px";
        }
      }
      timer = setTimeout(function() {
        if (footerScroll) {
          footerScroll.style.bottom = "0px";
        }

        // console.log("done scrolling");
      }, 150);
    },
    false
  );

  if (articles === null) {
    return <h1></h1>;
  } else
    return (
      <>
        <section className="main-page">
          <div className="category-description">
            <h3 className="category-description__title">Politics</h3>
            <p className="category-description__content">
              This is the category that is at the heart of Unbiased. To give the
              most credibility to the articles, the sources were filtered based
              on multiple charts that designated these sources to have the
              highest rating for "original fact reporting", with as little
              opinion reporting as possible. To remain impartial, there is a
              source or two that are considered more persuasive than the others,
              but popularity in American society pushed them in because a
              significant purpose of Unbiased is to allow readers access to
              common content. There is no direct intent to push political
              ideology, just an attempt to share views that are commonly held OR
              read.
            </p>
          </div>
          <div id="articleHeight" className="category-content">
            <MapArticles articles={currentArticles} />
          </div>
        </section>
        <div className="home-footer">
          <Footer />
        </div>
      </>
    );
}
