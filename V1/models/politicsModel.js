const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const politicsSchema = mongoose.Schema({
  source: Object,
  author: String,
  title: String,
  bias: String,
  description: { type: String, unique: true, dropDups: true },
  url: { type: String, unique: true, dropDups: true },
  imageURL: String,
  imageType: String,
  publishedAt: Date
});

//uniqueValidator makes sure there's no duplicates when posting new articles
politicsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("politicsArticle", politicsSchema);
