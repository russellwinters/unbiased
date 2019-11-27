const express = require("express");
const Router = express.Router();
const Sports = require("../models/sportsModel");

Router.get("/", async (req, res) => {
  const articles = await Sports.find()
    .sort({ publishedAt: -1 })
    .limit(20);
  res.status(200).json(articles);
});

module.exports = Router;
