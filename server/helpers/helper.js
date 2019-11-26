const shortid = require("shortid");
const fs = require("fs");

function writeJSONFile(filename, content) {
  console.log(filename, content);
  fs.writeFileSync(filename, JSON.stringify(content), "utf8", err => {
    if (err) {
      console.log(err);
    }
  });
  console.log(`changes saved to file ${filename}....`);
}

//Function from InStock, but might need it here.
function createID() {
  return shortid.generate();
}

module.exports = {
  createID,
  writeJSONFile
};
