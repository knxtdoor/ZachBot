const Discord = require("discord.js");
const fs = require("fs");
const bibleWords = JSON.parse(fs.readFileSync("./modules/behavior/bible.txt"));
exports.name = "behavior";
exports.config = {};
exports.process = (message) => {
  upvoteDownvote(message);
  tree(message);
  slashS(message);
  bible(message);
  she(message);
  // punish(message);
};

function slashS(message) {
  let rand = Math.random();
  if (rand < 0.003 && message.content.toLowerCase().search("/s") == -1) {
    message.channel.send("/s?");
  }
}

function tree(message) {
  let rand = Math.random();
  if (rand < 0.01) {
    message.react("1041196532520734730");
  }
}

function upvoteDownvote(message) {
  let rand = Math.random();

  if (rand < 0.05 || message.content.toLowerCase().search("zachbot") != -1) {
    rand = Math.random();
    if (rand < 0.5) {
      message.react("1027594645628276837");
    }
    if (rand >= 0.5) {
      message.react("1027651586002002041");
    }
  }
}

function punish(message) {
  content = message.content.toLowerCase();
  if (content.search("zachbot") != -1 && content.search("fuck you") != -1) {
    message.reply("Fuck you, voided.");
    let member = message.member;
    let roles = member.roles.cache;
    let voidRole = message.guild.roles.cache.filter((role) => {
      return role.name === "@everyone";
    });
    // console.log(message.guild.roles.cache.find((role) => { return role.name === "Void" }));
    console.log(voidRole);
    member.roles.set(voidRole).then(() => {
      setTimeout(() => {
        member.roles.set(roles);
      }, 5000);
    });
    // console.log();
  }
}

function bible(message) {
  let words = message.content.split(" ");
  if (words.length < 6) {
    return;
  }
  let numHits = 0;
  for (const word of words) {
    if (!bibleWords.includes(word.toLowerCase())) {
      numHits += 1;
    }
  }
  let hitRate = (numHits * 1.0) / words.length;
  if (hitRate > 0.75) {
    let hitRatePrint = hitRate * 100;
    message.reply(
      `${hitRatePrint.toFixed(2)}% of your message is not in the bible!`
    );
  }
}

function she(message) {
  let rand = Math.random();
  if (rand < .01) {
    let words = message.content.split(" ");
    let longWords = words.filter((word) => word.length > 5);
    if (longWords.length < 3) {
      return;
    }
	longWords.sort((a,b)=>Math.random()-.5);
	let firstWord = removePunctuation(longWords.pop());
    let secondWord = removePunctuation(longWords.pop());
    let thirdWord = removePunctuation(longWords.pop());

    message.channel.send(
      `She ${firstWord} on my ${secondWord} till I ${thirdWord}`
    );
  }
  function removePunctuation(word){
	return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
  }
}
