const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

//Models
const Science = require("../models/scienceModel");
const Sports = require("../models/sportsModel");
const Politics = require("../models/politicsModel");
const Business = require("../models/businessModel");
const Users = require("../models/UserModel");

router.post("/add", async (req, res) => {
  console.log(req.body);
  let { ARTICLE_ID, TOKEN } = req.body;

  //GET USER
  const USER_ID = jwt.verify(TOKEN, "unbiasedkeys").id;
  let USER = await Users.findById(USER_ID);
  let { bookmarks } = USER;

  //Add Bookmark to use
  bookmarks.push(ARTICLE_ID);
  USER.bookmarks = bookmarks;
  await USER.save().then((data) => console.log("Saved"));

  res.json({
    message: "Success",
  });
});

router.post("/get", async (req, res) => {
  let { token } = req.body;

  const USER_ID = jwt.verify(token, "unbiasedkeys").id;
  let USER = await Users.findById(USER_ID);
  let { bookmarks } = USER;

  //!Trying to do this faster using findById and conditionals, but failing to push anything. Very frustrated...
  // let GET_VALUE = async (id) => {
  //   let test1 = await Sports.findById(id);
  //   test1 ? testarray.push(test1) : console.log("failed");
  // };

  // let testarray = [];
  // bookmarks.forEach((id) => {
  //   GET_VALUE(id);
  //   console.log(testarray);
  // });
  // console.log(getArticles);
  const sportsArticles = await Sports.find().sort({ publishedAt: -1 });
  const scienceArticles = await Science.find().sort({ publishedAt: -1 });
  const businessArticles = await Business.find().sort({ publishedAt: -1 });
  const politicsArticles = await Politics.find().sort({ publishedAt: -1 });
  const ALL_ARTICLES = [
    ...sportsArticles,
    ...scienceArticles,
    ...politicsArticles,
    ...businessArticles,
  ];

  const RESPONSE_DATA = [];
  bookmarks.forEach((id) => {
    let article = ALL_ARTICLES.find((obj) => obj.id === id);

    if (article) {
      RESPONSE_DATA.push(article);
    }
  });

  console.log(RESPONSE_DATA);
  res.json({
    RESPONSE_DATA,
  });
});

module.exports = router;
