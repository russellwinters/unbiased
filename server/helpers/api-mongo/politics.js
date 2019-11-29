const express = require("express");
const politicsModel = require("../../models/politicsModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=40";
let NYTimes = "pageSize=15";
//strings for everything query in below URLS
const liberalString = "politico,the-washington-post";
const theTimes = "the-new-york-times";
const minimalBias = "abc-news,reuters,usa-today";
const conservativeString =
  "fox-news,the-wall-street-journal,national-review,the-hill";

const liberalURL = `https://newsapi.org/v2/everything?language=en&sources=${liberalString}&q=politics&${many}&apiKey=${capKey}`;
const conservativeURL = `https://newsapi.org/v2/everything?language=en&sources=${conservativeString}&q=politics&${many}&apiKey=${capKey}`;
const splitURL = `https://newsapi.org/v2/everything?language=en&sources=${minimalBias}&q=politics&${many}&apiKey=${capKey}`;
const timesURL = `https://newsapi.org/v2/everything?language=en&sources=${theTimes}&q=politics&${NYTimes}&apiKey=${capKey}`;

//split up
const newArticles = () => {
  axios.get(liberalURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new politicsModel({
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
      const article = new politicsModel({
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
      const article = new politicsModel({
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
      const article = new politicsModel({
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
};

module.exports = {
  newArticles
};
