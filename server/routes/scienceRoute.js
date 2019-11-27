const express = require("express");
const Router = express.Router();
const Science = require("../models/scienceModel");

Router.get("/", async (req, res) => {
  const articles = await Science.find()
    .sort({ publishedAt: -1 })
    .limit(20);
  res.status(200).json(articles);
});

module.exports = Router;
