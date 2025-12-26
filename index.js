require("dotenv").config();
const Discord = require("discord.js");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

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

let typeTimeStamp = 0;
client.on("ready", () => {
    console.log("Ready!");
    typeTimeStamp = Date.now();
    if (enabledModules.some((module) => module.name === "economy")) {
        setInterval(
            enabledModules.find((module) => module.name === "economy").sync,
            60000
        );
    }
    const awbwModule = enabledModules.find((module) => module.name == "awbw");
    if (awbwModule) {
        awbwModule.initialize(client);
        setInterval(awbwModule.check, 30000);
    }
    const vsModule = enabledModules.find(
        (module) => module.name == "vintagestory"
    );
    if (vsModule) {
        vsModule.initialize(client);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.id == config.general.botID) {
        return;
    }
    enabledModules.forEach((module) => module.process(message, client));
});
let typeCount = 0;

/*client.on("typingStart", async(channel,user) =>{
//  if (typing.member.id == "145605533230039040"){
  console.log("Typing start");
  if(typing.member.id == "138159506583584768"){
  console.log("hit");
    typeCount++;
    typeTimeStamp = Date.now();
    if(typeCount == 5){
    typing.channel.send("Wyatt has started typing 5 times");
    typeCount = 0;
    }
  }
  if (typeCount > 0 && Date.now() - typeTimeStamp > 600){
  typeCount = 0;
  }
});
*/
client.login(process.env.CLIENT_TOKEN);
