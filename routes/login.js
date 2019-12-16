const express = require("express");
const Router = express.Router();
const User = require("../models/UserModel");

Router.post("/api", async (req, res) => {
  let currentUser = req.body;
  console.log(currentUser);
  res.json({
    message: "success"
  });
});

module.exports = Router;
