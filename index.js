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
const Commands = require("./commands.js");
const Behavior = require("./behavior.js");
const Economy = require("./economy.js");

const config = Configuration.config;

client.on("ready", () => {
  console.log("Ready!");
  setInterval(Economy.sync, 60000);
});

client.on("messageCreate", async (message) => {
  if (message.author.id == config.general.bot_id) {
    return;
  }
  Behavior.behavior(message);
  Economy.process(message);

  if (message.content.startsWith(config.general.prefix)) {
    Commands.parse(message, client);
  }
});

client.login(process.env.CLIENT_TOKEN);
