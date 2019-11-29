const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const searchSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  description: { type: String, unique: true, dropDups: true },
  url: { type: String, unique: true, dropDups: true },
  publishedAt: Date
});

searchSchema.plugin(uniqueValidator);
module.exports = mongoose.model("searchCollection", searchSchema);
