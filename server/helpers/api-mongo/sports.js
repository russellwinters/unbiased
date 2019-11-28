const express = require("express");
const sportsModel = require("../../models/sportsModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=100";
//Strings for sport sources
const allSports = "espn,bleacher-report";
const football = "nfl-news";
const hockey = "nhl-news";
//Urls from corresponding news sources
const sportsURL = `https://newsapi.org/v2/everything?language=en&sources=${allSports}&${many}&apiKey=${capKey}`;
const footballURL = `https://newsapi.org/v2/everything?language=en&sources=${football}&${many}&apiKey=${capKey}`;
const hockeyURL = `https://newsapi.org/v2/everything?language=en&sources=${hockey}&${many}&apiKey=${capKey}`;

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
      const article = new sportsModel({
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
      const article = new sportsModel({
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
