const fs = require("fs");
const ini = require("ini");
const _ = require("lodash");
const { exit } = require("process");

const defaultConfig = generateDefaultConfig();

exports.config = readConfig();
exports.reload = reloadConfig;

function readConfig() {
  if (!fs.existsSync("./config.ini")) {
    console.log("Config doesn't exist, generating");
    writeOutConfig(defaultConfig);
  }
  config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

  config = updateConfig(config);
  return config;
}

function reloadConfig() {
  let localConfig = readConfig();
  localConfig = updateConfig(localConfig);
  exports.config = localConfig;
}

function updateConfig(userConfig) {
  localConfig = generateDefaultConfig();
  _.merge(localConfig, userConfig);
  writeOutConfig(localConfig);
  return localConfig;
}

function writeOutConfig(configToWrite) {
  fs.writeFileSync("./config.ini", ini.stringify(configToWrite));
}

function generateDefaultConfig() {
  let config = {
    general: {
      botID: "",
      prefix: "!",
    },
    permissions: {
      owner: "",
      roles: "admin,user",
      roleIDs: "",
    },
    commands: {},
  };
  let commands = Object.keys(require("./commands.js").commands);
  commands.forEach((command) => {
    config.commands[command] = { permissions: "admin" };
  });
  return config;
}
