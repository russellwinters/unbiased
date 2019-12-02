const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sportsSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  description: { type: String, unique: true, dropDups: true },
  url: { type: String, unique: true, dropDups: true },
  imageURL: String,
  imageType: String,
  publishedAt: Date
});

sportsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("sportsArticle", sportsSchema);
