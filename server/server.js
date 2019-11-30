const express = require("express");
const app = express();
const mongoose = require("mongoose");
const CORS = require("cors");
const helper = require("./helpers/helper");

//!This is to enable CORS on all API requests
app.use(CORS());

//Below function updates all Mongo Collections
helper.updatePosts();

//!Below section is for the API endpoints
app.use("/politics", require("./routes/politicsRoute.js"));
app.use("/business", require("./routes/businessRoute.js"));
app.use("/sports", require("./routes/sportsRoute.js"));
app.use("/science", require("./routes/scienceRoute.js"));

//Connect to MongoDB
const mongoURL = "mongodb://localhost:27017/unbiased";
mongoose.connect(
  mongoURL,
  { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("Connected to MongoDB!");
  }
);

//Listen to LocalHost
const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server is listening on port ${PORT}`);
});
