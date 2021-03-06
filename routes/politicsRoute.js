const express = require("express");
const Router = express.Router();
const Politics = require("../models/politicsModel");

Router.get("/api", async (req, res) => {
  const articles = await Politics.find()
    .sort({ publishedAt: -1 })
    .limit(60);
  const returnArr = [];
  for (i = 0; i < 6; i++) {
    returnArr.push(articles.splice(0, 10));
  }
  res.status(200).json(returnArr);
});

module.exports = Router;
