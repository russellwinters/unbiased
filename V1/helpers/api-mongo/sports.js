const express = require("express");
const sportsModel = require("../../models/sportsModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = `${process.env.CAP_KEY}`;
let many = "pageSize=100";
let some = "pageSize=50;";
//Strings for sport sources
const allSports = "bleacher-report";
const football = "nfl-news";
const hockey = "nhl-news";
//Urls from corresponding news sources
const sportsURL = `https://newsapi.org/v2/everything?language=en&sources=${allSports}&${many}&apiKey=${capKey}`;
const espnURL = `https://newsapi.org/v2/top-headlines?language=en&sources=espn&${many}&apiKey=${capKey}`;
const footballURL = `https://newsapi.org/v2/everything?language=en&sources=${football}&${some}&apiKey=${capKey}`;
const hockeyURL = `https://newsapi.org/v2/everything?language=en&sources=${hockey}&${many}&apiKey=${capKey}`;

//Pushing all articles into database after each axios call
const newArticles = () => {
  axios.get(sportsURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new sportsModel({
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
  axios.get(espnURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new sportsModel({
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
  axios.get(footballURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new sportsModel({
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
  axios.get(hockeyURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new sportsModel({
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
