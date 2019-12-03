const businessArticles = require("./api-mongo/business");
const sportsArticles = require("./api-mongo/sports");
const scienceArticles = require("./api-mongo/science");
const politicsArticles = require("./api-mongo/politics");

function updatePosts() {
  const today = new Date();
  if (
    (today.getHours() === 16 && today.getMinutes() <= 30) ||
    (today.getHours() === 8 && today.getMinutes() <= 35)
  ) {
    businessArticles.newArticles();
    sportsArticles.newArticles();
    scienceArticles.newArticles();
    politicsArticles.newArticles();
  }
}

module.exports = {
  updatePosts
};
