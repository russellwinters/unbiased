const express = require("express");
const scienceModel = require("../../models/scienceModel");
const mongoose = require("mongoose");
const axios = require("axios");

let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=80";
const scienceURL = `https://newsapi.org/v2/top-headlines?category=science&country=us&${many}&apiKey=${capKey}`;

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
