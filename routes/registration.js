const express = require("express");
const Router = express.Router();
const User = require("../models/UserModel");

Router.post("/api", async (req, res) => {
  let newUser = req.body;
  let database = await User.find();
  const checkUser = user => {
    const check = database.some(obj => obj.username === user.username);
    if (!check) {
      console.log("false");
      const create = new User({
        username: user.username,
        password: user.password
      });
      create
        .save()
        .then(data => console.log("User successfully added!"))
        .catch(err => console.log(err));
    } else {
      console.log("true");
    }
  };
  checkUser(newUser);
  res.json({
    message: "success"
  });
});

module.exports = Router;
