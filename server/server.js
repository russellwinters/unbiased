const express = require("express");
const app = express();
const populateFile = require("./helpers/populatefile");
const axios = require("axios");
const fs = require("fs");
// const writeTopHeadlines = require(populateFile);

// app.use(writeTopHeadlines);
let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
const businessURL = `https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=${capKey}`;
const politicsURL = `https://newsapi.org/v2/everything?q=politics&language=en&apiKey=${capKey}`;
const scienceURL = `https://newsapi.org/v2/top-headlines?category=science&country=us&apiKey=${capKey}`;
const sportsURL = `https://newsapi.org/v2/top-headlines?category=sports&country=us&apiKey=${capKey}`;
//File Paths and array names
//business
const businessFile = __dirname + "/models/topBusiness.json";
const bfp = "./models/topBusiness.json";
const businessArray = require(businessFile);
//politics
const politicsFile = __dirname + "/models/topPolitics.json";
const pfp = "./models/topPolitics.json";
const politicsArray = require(politicsFile);
//science
const scienceFile = __dirname + "/models/topScience.json";
const scfp = "./models/topScience.json";
const scienceArray = require(scienceFile);
//sports
const sportsFile = __dirname + "/models/topSports.json";
const spfp = "./models/topSports.json";
const sportsArray = require(sportsFile);

//Make an axios call using the files to rewrite the files based on new api data.
//This function will eventually take the filepath, URL for axios, and array from JSON
const updateJSON = function(URL, arr, file) {
  axios.get(URL).then(response => {
    let returnArray = response.data.articles;
    let newArticles = returnArray.filter(obj => obj.description);
    let newFile = arr.concat(newArticles);
    console.log(newFile.length);
    fs.writeFileSync(`${file}`, JSON.stringify(newFile), err => {
      if (err) console.log(err);
    });
  });
};
// updateJSON(politicsURL, politicsArray, pfp);

//Trying the helper file
// populateFile.updateSports;
// alterJSON(sportsArray, spfp);
const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server is listening on port ${PORT}`);
});
