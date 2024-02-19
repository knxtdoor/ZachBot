require("dotenv").config();
const Discord = require("discord.js");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  }
  if (key.name === "r") {
    process.exit(10);
  }
});

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildMessageReactions,
  ],
});

const Configuration = require("./config.js");
const config = Configuration.config;
let enabledModules = Object.keys(config.modules)
  .filter((module) => config.modules[module])
  .map((moduleName) => require(`./modules/${moduleName}/${moduleName}.js`));

client.on("ready", () => {
  console.log("Ready!");
  if (enabledModules.some((module) => module.name === "economy")) {
    setInterval(
      enabledModules.find((module) => module.name === "economy").sync,
      60000
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.id == config.general.botID) {
  	return;
  }
  enabledModules.forEach((module) => module.process(message, client));
});

client.login(process.env.CLIENT_TOKEN);
