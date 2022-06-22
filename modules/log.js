const fs = require("fs");

const log = async (data, filepath = "./data/log.txt") => {
  try {
    if (data) {
      if (
        data.constructor === {}.constructor ||
        data.constructor === [].constructor
      ) {
        data = JSON.stringify(data, null, "\t");
      }
    }
    let date = new Date();
    let time = `[${date.getFullYear()}.${
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1
    }.${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}_${
      date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    }:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
    }]`;
    console.log(`${time} ${data}`);
    fs.appendFileSync(filepath, `${time} ${data}\n`);
  } catch (e) {
    throw e;
  }
};
module.exports = log;
