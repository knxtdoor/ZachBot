require("dotenv").config();
const Discord = require("discord.js");
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
const config = Configuration.config;

client.on("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.id == config.general.bot_id) {
    return;
  }
  Behavior.behavior(message);

  if (message.content.startsWith(config.general.prefix)) {
    Commands.parse(message);
  }
});

client.login(process.env.CLIENT_TOKEN);
