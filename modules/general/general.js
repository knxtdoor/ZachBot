const permissions = require("../../permissions.js");
const mtg = require("./mtg.js");
const Configuration = require("../../config.js");
const imageHandler = require("./image.js");

exports.name = "general";

exports.process = (message, client) => {
  if (message.content[0] !== Configuration.config.general.prefix) {
    return;
  }
  const command = message.content.substring(1).split(" ");
  if (commands[command[0]] == undefined) {
    message.channel.send("unknown command");
    return;
  }
  if (permissions.checkPerms(message.member, command[0])) {
    commands[command[0]](message, command, client);
  } else {
    message.channel.send("You do not have permission to use this command.");
  }
};

commands = {
  warn,
  warm,
  ping,
  bother,
  card,
  reload,
  image,
  loseRole,
  say,
};
exports.commands = commands;

function warn(message, args) {
  let mentions = message.mentions.users;
  if (mentions.size != 1) {
    message.channel.send("Improper usage, only mention one user!");
  }
  let warnMessage;
  let warned = mentions.at(0);
  if (args.length == 2) {
    warnMessage = `${warned}, you have been warned!`;
  } else {
    warnMessage = `${warned}, you have been warned\n> ${args
      .slice(2)
      .join(" ")}`;
  }
  message.channel.send(warnMessage);
}
function warm(message) {
  message.channel.send("Learn to spell idiot");
}
function ping(message) {
  message.channel.send("pong!");
}

botherList = {};
function bother(message, args) {
  author = message.author;
  if (args[1] === "end") {
    message.channel.send("Stopping bother");
    clearInterval(botherList[author.id]);
    delete botherList[author.id];
  } else if (message.mentions.users.size != 0) {
    target = message.mentions.users.first();
    if (botherList[author.id] == undefined) {
      message.channel.send(`Preparing to bother ${target}`);
      botherList[author.id] = setInterval(() => {
        message.channel.send(`hey ${target}`);
      }, 5000);
    } else {
      message.channel.send("You can only bother 1 person at a time!");
    }
  } else {
    message.channel.send("Please mention someone to bother them.");
  }
}
function card(message, args) {
  mtg.getCard(args, message);
}
function reload(message) {
  message.channel.send("Reloading config...");
  Configuration.reload();
}
function image(message, args) {
  imageHandler.manip(message, args);
}
function loseRole(message, args) {
  let user = message.mentions.members.at(0);
  let role = message.mentions.roles.at(0);
  timeout = () => {
    user.roles.add(role);
  };
  user.roles.remove(role);
  setTimeout(timeout, 1000 * 60 * 60);
}
function say(message, args, client) {
  const msg = args.slice(1).join(" ");
  const general = client.channels.cache.get(
    Configuration.config.general.generalID
  );
  general.send(msg);
}
