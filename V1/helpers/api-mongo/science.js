const express = require("express");
const scienceModel = require("../../models/scienceModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = `${process.env.CAP_KEY}`;
let many = "pageSize=80";
//Strings for scientific news sources
const healthNews = "medical-news-today";
const scienceNews = "new-scientist,next-big-future";
const earthNews = "national-geographic";
//URLS from corresponding sources
const healthURL = `https://newsapi.org/v2/everything?language=en&sources=${healthNews}&${many}&apiKey=${capKey}`;
const scienceURL = `https://newsapi.org/v2/everything?language=en&sources=${scienceNews}&q=science&${many}&apiKey=${capKey}`;
const earthURL = `https://newsapi.org/v2/everything?language=en&sources=${earthNews}&${many}&apiKey=${capKey}`;

//Pushing all articles into database after each axios call
const newArticles = () => {
  axios.get(scienceURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new scienceModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        imageURL: obj.urlToImage,
        imageType: "tall-image",
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"))
        .catch(err => console.log(err));
    });
  });
  axios.get(healthURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new scienceModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        imageURL: obj.urlToImage,
        imageType: "tall-image",
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"))
        .catch(err => console.log(err));
    });
  });
  axios.get(earthURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new scienceModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        imageURL: obj.urlToImage,
        imageType: "tall-image",
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"))
        .catch(err => console.log(err));
    });
  });
};

module.exports = {
  newArticles
};
