const express = require("express");
const Router = express.Router();
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

Router.post("/api", async (req, res) => {
  let currentUser = req.body; //login credentials from form
  //Creading an array of users and of usernames that will help match user.
  let db_users = await User.find();
  let usernames = db_users.map(obj => {
    return obj.username;
  });
  const currentUserIndex = usernames.indexOf(currentUser.username);
  const returnUser = db_users[currentUserIndex]; //User that's logging in
  if (returnUser.password === currentUser.password) {
    const userID = returnUser.id;
    jwt.sign({ id: `${userID}` }, "unbiasedkeys", (err, token) => {
      res.json({ token });
    });
    console.log(userID);
  }
});

module.exports = Router;
