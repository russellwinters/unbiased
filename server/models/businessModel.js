const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const businessSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  description: { type: String, unique: true, dropDups: true },
  url: { type: String, unique: true, dropDups: true },
  imageURL: String,
  publishedAt: Date
});

businessSchema.plugin(uniqueValidator);
module.exports = mongoose.model("businessArticle", businessSchema);
