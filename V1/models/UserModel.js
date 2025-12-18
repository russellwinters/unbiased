const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  bookmarks: Array
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("userBase", userSchema);
