const express = require("express");
const businessModel = require("../../models/businessModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=80";
//strings for sources
const business = "fortune,bloomberg,";
const moreBusiness = "business-insider,reuters";
//Urls to correspond with strings from above
const businessURL = `https://newsapi.org/v2/everything?language=en&sources=${business}&${many}&apiKey=${capKey}`;
const moreBusinessURL = `https://newsapi.org/v2/everything?language=en&sources=${moreBusiness}&${many}&apiKey=${capKey}`;

const newArticles = () => {
  axios.get(businessURL).then(response => {
    tempArr = response.data.articles;
    tempArr.forEach(obj => {
      const article = new businessModel({
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
      const article = new businessModel({
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
