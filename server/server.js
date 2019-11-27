const express = require("express");
const app = express();
const mongoose = require("mongoose");
const businessArticles = require("./helpers/api-mongo/business");
const sportsArticles = require("./helpers/api-mongo/sports");
const scienceArticles = require("./helpers/api-mongo/science");
const politicsArticles = require("./helpers/api-mongo/politics");

//!Below functions will post to database from API I'm using.
// businessArticles.newArticles();
// sportsArticles.newArticles();
// scienceArticles.newArticles();
// politicsArticles.newArticles();

//Connect to MongoDB
const mongoURL = "mongodb://localhost:27017/unbiased";
mongoose.connect(mongoURL, { useNewUrlParser: true }, () => {
  console.log("Connected to MongoDB!");
});

//Listen to LocalHost
const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server is listening on port ${PORT}`);
});
