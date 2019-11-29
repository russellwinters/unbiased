const express = require("express");
const searchModel = require("../../models/searchModel");
const mongoose = require("mongoose");
const axios = require("axios");

//!global axios needs
let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=40";
let NYTimes = "pageSize=15";
//!ALL source strings
const liberalString = "politico,the-washington-post";
const theTimes = "the-new-york-times";
const minimalBias = "abc-news,reuters,usa-today";
const conservativeString =
  "fox-news,the-wall-street-journal,national-review,the-hill";
const healthNews = "medical-news-today";
const scienceNews = "new-scientist,next-big-future";
const earthNews = "national-geographic";
const business = "fortune,bloomberg,";
const moreBusiness = "business-insider,reuters";
const allSports = "espn,bleacher-report";
const football = "nfl-news";
const hockey = "nhl-news";

//!ALL source URLs
const liberalURL = `https://newsapi.org/v2/everything?language=en&sources=${liberalString}&q=politics&${many}&apiKey=${capKey}`;
const conservativeURL = `https://newsapi.org/v2/everything?language=en&sources=${conservativeString}&q=politics&${many}&apiKey=${capKey}`;
const splitURL = `https://newsapi.org/v2/everything?language=en&sources=${minimalBias}&q=politics&${many}&apiKey=${capKey}`;
const timesURL = `https://newsapi.org/v2/everything?language=en&sources=${theTimes}&q=politics&${NYTimes}&apiKey=${capKey}`;
const healthURL = `https://newsapi.org/v2/everything?language=en&sources=${healthNews}&${many}&apiKey=${capKey}`;
const scienceURL = `https://newsapi.org/v2/everything?language=en&sources=${scienceNews}&q=science&${many}&apiKey=${capKey}`;
const earthURL = `https://newsapi.org/v2/everything?language=en&sources=${earthNews}&${many}&apiKey=${capKey}`;
const businessURL = `https://newsapi.org/v2/everything?language=en&sources=${business}&${many}&apiKey=${capKey}`;
const moreBusinessURL = `https://newsapi.org/v2/everything?language=en&sources=${moreBusiness}&${many}&apiKey=${capKey}`;
const sportsURL = `https://newsapi.org/v2/everything?language=en&sources=${allSports}&${many}&apiKey=${capKey}`;
const footballURL = `https://newsapi.org/v2/everything?language=en&sources=${football}&${many}&apiKey=${capKey}`;
const hockeyURL = `https://newsapi.org/v2/everything?language=en&sources=${hockey}&${many}&apiKey=${capKey}`;

const newArticles = () => {
  //!ALL Axios requests
  axios.get(liberalURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article.save().then(data => console.log(data));
    });
  });
  axios.get(conservativeURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article.save().then(data => console.log(data));
    });
  });
  axios.get(splitURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article.save().then(data => console.log(data));
    });
  });
  axios.get(timesURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article.save().then(data => console.log(data));
    });
  });
  axios.get(scienceURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(healthURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(earthURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(sportsURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(footballURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(hockeyURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(businessURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
  axios.get(moreBusinessURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new searchModel({
        source: obj.source,
        author: obj.author,
        title: obj.title,
        description: obj.description,
        url: obj.url,
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"));
    });
  });
};

module.exports = {
  newArticles
};
