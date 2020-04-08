import React, { useState, useEffect } from "react";
import MapArticles from "../MapArticles";
import axios from "axios";
import Footer from "../Footer";
import spinner from "../../assets/loading-spinner.gif";

export default function SportsNews() {
  const [articles, setArticles] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentArticles, setCurrentArticles] = useState([]);

  useEffect(() => {
    if (articles === null) {
      let user = {
        token: localStorage.getItem("token"),
      };
      axios({
        method: "post",
        url: "http://localhost:5000/api/bookmark/get",
        data: user,
      }).then((response) => {
        console.log(response.data);
        setArticles(response.data.RESPONSE_DATA);
        setCurrentArticles(response.data.RESPONSE_DATA);
      });
    }
  });

  //Constant for infinite scroll
  const idSelector = document.querySelector("#articleHeight");
  //Listening if height of the element is less than the window height plus distance we've scrolled
  window.onscroll = function (ev) {
    if (window.innerHeight + window.scrollY >= idSelector.offsetHeight) {
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
    function () {
      if (timer !== null) {
        clearTimeout(timer);
        if (footerScroll) {
          footerScroll.style.bottom = "-100px";
        }
      }
      timer = setTimeout(function () {
        if (footerScroll) {
          footerScroll.style.bottom = "0px";
        }
      }, 150);
    },
    false
  );

  if (articles === null) {
    return (
      <section className="loading">
        <h1 className="loading-title">Loading</h1>
        <img className="loading-img" src={spinner} alt="loading" />
      </section>
    );
  } else
    return (
      <>
        <section className="main-page">
          <div className="category-description">
            <h3 className="category-description__title">Sports</h3>
            <p className="category-description__content">
              Sports are naturally unbiased, and that's how we like it! With
              that being said, the feed below pulls mostly from ESPN and
              BleacherReport, but also includes articles from NFL News and NHL
              News.
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
