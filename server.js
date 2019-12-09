const express = require("express");
const app = express();
const mongoose = require("mongoose");
const CORS = require("cors");
const helper = require("./helpers/helper");
const path = require("path");

//!This is to enable CORS on all API requests
app.use(CORS());

//Below function updates all Mongo Collections
helper.updatePosts();

//!Below section is for the API endpoints
app.use("/politics", require("./routes/politicsRoute.js"));
app.use("/business", require("./routes/businessRoute.js"));
app.use("/sports", require("./routes/sportsRoute.js"));
app.use("/science", require("./routes/scienceRoute.js"));
app.use("/search", require("./routes/searchRoute.js"));

//Connect to MongoDB Compass - Local Database
// const mongoURL = "mongodb://localhost:27017/unbiased";

//Connect to MongoDB Atlas
const mongoURL = `${process.env.DB_KEY}`;

mongoose.connect(
  process.env.MONGODB_URI || mongoURL,
  { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("Connected to MongoDB!");
  }
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//Listen to LocalHost
const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server is listening on port ${PORT}`);
});
