const permissions = require("../../permissions.js");
const mtg = require("./mtg.js");
const vlrHandler = require("./vlr.js");
const Configuration = require("../../config.js");
const imageHandler = require("./image.js");
const awbwHandler = require("../awbw/awbw.js")
const { MessageReaction } = require("discord.js");

exports.name = "general";
exports.config = {};
exports.process = (message, client) => {
    if (message.content[0] !== Configuration.config.general.prefix) {
        return;
    }
    const command = message.content.substring(1).split(" ");
    if (commands[command[0]] == undefined) {
        //message.channel.send("unknown command");
        return;
    }
    if (permissions.checkPerms(message.member, command[0])) {
        commands[command[0]](message, command, client);
    } else {
        //message.channel.send("You do not have permission to use this command.");
        warnMsg = command.slice(2).join(" ").toLowerCase();
        if (warnMsg == "you do not have permission to use this command") {
            doWarn(message.channel, "Nice try idiot", message.author);
            return;
        }
        doWarn(
            message.channel,
            "You do not have permission to use this command",
            message.author
        );
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
    tarot,
    him,
    pickem,
};
exports.commands = commands;

function doWarn(channel, warnMessage, user) {
    if (warnMessage != "") {
        channel.send(`${user}, you have been warned\n> ${warnMessage}`);
    } else {
        channel.send(`${user}, you have been warned`);
    }
}

function warn(message, args) {
    let mentions = message.mentions.users;
    if (mentions.size != 1) {
        message.channel.send("Improper usage, only mention one user!");
        return;
    }
    warnMsg = args.slice(2).join(" ");
    doWarn(message.channel, warnMsg, mentions.at(0));
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
const tarotCards = [
    "0: The Fool",
    "I: The Magician",
    "II: The High Priestess",
    "III: The Empress",
    "IV: The Emperor",
    "V: The Hierophant",
    "VI: The Lovers",
    "VII: The Chariot",
    "VIII: Strength",
    "IX: The Hermit",
    "X: Wheel of Fortune",
    "XI: Justice",
    "XII: The Hanged Man",
    "XIII: Death",
    "XIV: Temperance",
    "XV: The Devil",
    "XVI: The Tower",
    "XVII: The Star",
    "XVIII: The Moon",
    "XIX: The Sun",
    "XX: Judgement",
    "XXI: The World",
];
function tarot(message) {
    drawnCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    message.reply(`You drew \`${drawnCard}\``);
}
function him(message, args) {
    vlrHandler.him(message, args);
}
function pickem(message, args) {
    vlrHandler.pickem(message, args);
}
