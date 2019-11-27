const express = require("express");
const Router = express.Router();
const Business = require("../models/businessModel");

Router.get("/", async (req, res) => {
  const articles = await Business.find()
    .sort({ publishedAt: -1 })
    .limit(20);
  res.status(200).json(articles);
});

module.exports = Router;
