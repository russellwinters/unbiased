const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const politicsSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  description: { type: String, unique: true, dropDups: true },
  url: { type: String, unique: true, dropDups: true },
  publishedAt: Date
});

politicsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("politicsArticle", politicsSchema);
