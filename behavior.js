
const Discord = require("discord.js");

exports.behavior = (message) => {
    // if (message.content.toLowerCase().search("zachbot") != -1 && message.content.toLowerCase().search("will") != -1) {
    //     message.channel.send("Happy birthday will");
    // }
    upvoteDownvote(message);
    tree(message);
    slashS(message);
    // punish(message);
}


function slashS(message){
    let rand = Math.random()
    if(rand <.003 && message.content.toLowerCase().search("/s") == -1){
         message.channel.send("/s?");
    }
}

function tree(message){
    let rand = Math.random()
    if(rand <.01){
         message.react("1041196532520734730")
    }
}

function upvoteDownvote(message) {
    let rand = Math.random()

    if (rand < .05 || message.content.toLowerCase().search("zachbot") != -1) {
        rand = Math.random()
        if (rand < .5) {
            message.react("1027594645628276837");
        }
        if (rand >= .5) {
            message.react("1027651586002002041");
        }
    }
}

function punish(message) {
    content = message.content.toLowerCase();
    if (content.search("zachbot") != -1 && content.search("fuck you") != -1) {
        message.reply("Fuck you, voided.");
        let member = message.member
        let roles = member.roles.cache;
        let voidRole = message.guild.roles.cache.filter((role) => {
            return role.name === "@everyone"
        });
        // console.log(message.guild.roles.cache.find((role) => { return role.name === "Void" }));
        console.log(voidRole);
        member.roles.set(voidRole).then(() => {
            setTimeout(() => {
                member.roles.set(roles);
            }, 5000);


        })
        // console.log();
    }
}
