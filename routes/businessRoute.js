const express = require("express");
const Router = express.Router();
const Business = require("../models/businessModel");

Router.get("/api", async (req, res) => {
  const articles = await Business.find()
    .sort({ publishedAt: -1 })
    .limit(60);
  const returnArr = [];
  for (i = 0; i < 6; i++) {
    returnArr.push(articles.splice(0, 10));
  }
  res.status(200).json(returnArr);
});

module.exports = Router;
