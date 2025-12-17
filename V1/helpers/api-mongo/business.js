const express = require("express");
const businessModel = require("../../models/businessModel");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

let capKey = `${process.env.CAP_KEY}`;
let many = "pageSize=100";
//strings for sources
const business = "fortune";
const moreBusiness = "business-insider,reuters";
//Urls to correspond with strings from above
const businessURL = `https://newsapi.org/v2/everything?language=en&sources=${business}&q=business&${many}&apiKey=${capKey}`;
const moreBusinessURL = `https://newsapi.org/v2/everything?language=en&sources=${moreBusiness}q=business&${many}&apiKey=${capKey}`;

//Pushing all articles into database after each axios call
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
        imageURL: obj.urlToImage,
        imageType: "wide-image",
        publishedAt: obj.publishedAt
      });
      article
        .save()
        .then(data => console.log("Data was sucessfully entered!!"))
        .catch(err => console.log(err));
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
        imageURL: obj.urlToImage,
        imageType: "wide-image",
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
