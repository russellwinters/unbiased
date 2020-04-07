const businessArticles = require("./api-mongo/business");
const sportsArticles = require("./api-mongo/sports");
const scienceArticles = require("./api-mongo/science");
const politicsArticles = require("./api-mongo/politics");

function updatePosts() {
  //This function is going to post new articles to my DB
  const today = new Date();
  if (
    (today.getHours() === 8 && today.getMinutes() <= 30) ||
    (today.getHours() === 16 && today.getMinutes() <= 30)
  ) {
    businessArticles.newArticles();
    sportsArticles.newArticles();
    scienceArticles.newArticles();
    politicsArticles.newArticles();
  }
}

module.exports = {
  updatePosts,
};
