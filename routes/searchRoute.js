const express = require("express");
const Router = express.Router();
const Science = require("../models/scienceModel");
const Sports = require("../models/sportsModel");
const Politics = require("../models/politicsModel");
const Business = require("../models/businessModel");

Router.get("/api", async (req, res) => {
  let returnArr = [];
  const sportsArticles = await Sports.find().sort({ publishedAt: -1 });
  const scienceArticles = await Science.find().sort({ publishedAt: -1 });
  const businessArticles = await Business.find().sort({ publishedAt: -1 });
  const politicsArticles = await Politics.find().sort({ publishedAt: -1 });
  //spreading each article array into one huge array that will be filtered through when a search is made.
  returnArr = [
    ...politicsArticles,
    ...businessArticles,
    ...scienceArticles,
    ...sportsArticles
  ];
  res.status(200).json(returnArr);
});

module.exports = Router;
