const fs = require("fs");

let econ = readEconomy();
exports.name = "economy";

exports.process = (message) => {
  user = message.author;
  if (econ[user.id] == undefined) {
    econ[user.id] = newUser();
  }
  econ[user.id].balance++;
};

exports.sync = syncFile;

function readEconomy() {
  return JSON.parse(fs.readFileSync("./modules/economy/economy.json"));
}
function syncFile() {
  fs.writeFileSync("./modules/economy/economy.json", JSON.stringify(econ));
}
function newUser() {
  return { balance: 0 };
}
