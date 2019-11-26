const axios = require("axios");
const fs = require("fs");
//Constants for the API key and cap of 80 headlines
let capKey = "cb4bfe6e9f074ed48426d8448833f7e3";
let many = "pageSize=80";

const sportsURL = `https://newsapi.org/v2/top-headlines?category=sports&country=us&apiKey=${capKey}`;
const spfp = "./models/topSports.json";
const sportsFile = __dirname + "../../models/topSports.json";
const sportsArray = require(sportsFile);

const updateJSON = function(URL, arr, file) {
  axios.get(URL).then(response => {
    let returnArray = response.data.articles;
    let newArticles = returnArray.filter(obj => obj.description);
    console.log(arr.length); //Check original length
    let newFile = arr.concat(newArticles);
    let nextFile = [];
    newFile.forEach(obj => {
      if (!nextFile.some(obj)) {
        nextFile.push(obj);
      }
    });
    console.log(nextFile);
    // const finalArr = Array.from(new Set(newFile));
    // console.log(finalArr.length); //check the new set length
    console.log(newFile.length); //check final length of the original formula
    // fs.writeFileSync(`${file}`, JSON.stringify(newFile), err => {
    //   if (err) console.log(err);
    // });
  });
};

const updateSports = updateJSON(sportsURL, sportsArray, spfp);

module.exports = {
  updateSports
};
