const express = require("express");
const Router = express.Router();
const Politics = require("../models/politicsModel");

Router.get("/", async (req, res) => {
  const articles = await Politics.find()
    .sort({ publishedAt: -1 })
    .limit(20);
  res.status(200).json(articles);
});

module.exports = Router;
