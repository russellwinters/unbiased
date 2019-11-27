const mongoose = require("mongoose");

const businessSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  description: String,
  url: String,
  publishedAt: String
});

module.exports = mongoose.model("businessArticle", businessSchema);
