const express = require("express");
const politicsModel = require("../../models/politicsModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=80";
const politicsURL = `https://newsapi.org/v2/everything?q=politics&language=en&${many}&apiKey=${capKey}`;

const newArticles = () => {
  axios.get(politicsURL).then(response => {
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

// const sortArticles = () => {
//   const checkDisplay = politicsModel.find({
//     author: { $eq: "Alexandra Schwartz" }
//   });
//   console.log(checkDisplay);
// };

module.exports = {
  newArticles
  // sortArticles
};
