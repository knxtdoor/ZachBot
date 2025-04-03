const axios = require("axios");
const fs = require("fs");
const jsdom = require("jsdom");
const Configuration = require("../../config.js");
const { JSDOM } = jsdom;

storagePath = "./modules/awbw/awbw.json";
gameURL = "https://awbw.amarriner.com/game.php";

gameList = [];
userMap = {};
lastCheck = {};
awChannel = null;

exports.name = "awbw";
exports.initialize = (client) => {
    console.log("Initializing AWBW");
    if (fs.existsSync(storagePath)) {
        console.log("AWBW data found, restoring...");
        file = JSON.parse(fs.readFileSync(storagePath));
        gameList = file.gameList;
        userMap = file.userMap;
    }
    numUsers = Object.keys(userMap).length;
    console.log(
        `${numUsers} users loaded and ${gameList.length} games being tracked`
    );
    awChannel = client.channels.cache.get(Configuration.config.general.awbwID);
};

function save() {
    data = { gameList, userMap };
    console.log(
        `Saving awbw data ${JSON.stringify(data)} storage path ${storagePath}`
    );
    fs.writeFileSync(storagePath, JSON.stringify(data));
}

function registerUser(message, args) {
    const awbwUser = args[2].trim();
    if (awbwUser in userMap) {
        message.channel.send("That user is already registered!");
        return;
    }

    if (Object.values(userMap).some((id) => id == String(message.author.id))) {
        message.channel.send(
            "You are already associated with another account, unregister first!"
        );
        return;
    }
    userMap[awbwUser] = message.author.id;
    message.channel.send(`Successfully associated you with user ${awbwUser}`);
}
function unregisterUser(message, args) {
    const userId = message.author.id;
    const awbwUsername = Object.keys(userMap).find(
        (key) => userMap[key] === userId
    );
    if (awbwUsername) {
        delete userMap[awbwUsername];
        message.channel.send(
            `Successfully unregistered you from username ${awbwUsername}!`
        );
    } else {
        message.channel.send("You are not registered!");
    }
}
async function trackGame(message, args) {
    newGameId = args[2].trim();
    if (newGameId in gameList) {
        message.channel.send("Already tracking that game!");
        return;
    }

    response = (await axios.get(`${gameURL}?games_id=${newGameId}`)).data;
    const gamePage = new JSDOM(response).window.document;
    const allPlayersBox = gamePage.querySelector(".game-player-info");
    // if (response.rawHtml.contains("No game found")) {
    //     message.channel.send("Invalid game id.");
    //     return;
    // }
    const allPlayers = [...allPlayersBox.children].map((player) => {
        playerName = player.querySelector(".player-username>a").title;
        return playerName;
    });
    message.channel.send(
        `Tracking new game! The players are ${allPlayers.join(", ")}`
    );
    gameList.push(newGameId);
}
function finishGame(gameId) {
    gameList = gameList.filter((id) => id != gameId);
    save();
    return;
}
async function checkTurn(gameId) {
    try {
        response = await axios.get(`${gameURL}?games_id=${gameId}`);
        // console.log(response)
    } catch (e) {
        console.log("Error retrieving game with id", gameId);
        // console.log("Exception: ", e);
        fs.writeFileSync("./error.log", JSON.stringify(e));
        return;
    }
    if (response.status != 200) {
        console.log(`HTTP error ${response.status}`);
        return;
    }
    const data = response.data;
    const gamePage = new JSDOM(data).window.document;

    const gameName = gamePage.querySelector(
        ".game-header-header>a"
    ).textContent;
    const turnNum = parseInt(
        gamePage.querySelector(".game-header-info").textContent.split(" ")[1]
    );
    const gameOver = data.match(/endData.=.({.*})/) != null;

    const allPlayersBox = gamePage.querySelector(".game-player-info");
    const playerDetails = [...allPlayersBox.children].map((player) => {
        const playerName = player.querySelector(".player-username>a").title;
        let isTurn = false;
        let isEliminated = false;
        let team = null;
        if (player.querySelector(".current-turn-arrow")) {
            isTurn = true;
        }
        if (player.querySelector(".player-overview-eliminated-bg")) {
            isEliminated = true;
        }
        if (player.querySelector(".player-info-team")) {
            const regex = /([a-zA-Z])\.gif/;
            const teamPic = player.querySelector(".player-info-team>img").src;
            team = teamPic.match(regex)[1];
        }
        return { playerName, isTurn, isEliminated, team };
    });

    const alivePlayers = playerDetails.filter((p) => !p.isEliminated);
    const aliveTeams = [...new Set(alivePlayers.map((p) => p.team))];
    if (gameOver) {
        const playerString = alivePlayers.map((p) => p.playerName).join(", ");
        awChannel.send(
            `Game: ${gameName} (${gameId}) Day ${turnNum}- ${playerString} have won!`
        );
        finishGame(gameId);
        return;
    }
    if (alivePlayers.length == 1) {
        awChannel.send(
            `Game: ${gameName} (${gameId}) Day ${turnNum}- ${alivePlayers[0].playerName} has won!`
        );
        finishGame(gameId);
        return;
    }
    const currPlayer = playerDetails.find((o) => o.isTurn);
    if (gameId in lastCheck && lastCheck[gameId] == currPlayer.playerName) {
        return;
    }

    if (currPlayer.playerName in userMap) {
        awChannel.send(
            `Game: ${gameName} (${gameId}) Day ${turnNum}- It is ${currPlayer.playerName
            }'s turn! <@${userMap[currPlayer.playerName]}>`
        );
    } else {
        awChannel.send(
            `Game: ${gameName} (${gameId}) Day ${turnNum}- It is ${currPlayer.playerName}'s turn! They should do \`!awbw register {username}\` to associate their username!`
        );
    }
    lastCheck[gameId] = currPlayer.playerName;
}

exports.process = async (message, client) => {
    if (message.content[0] !== Configuration.config.general.prefix) {
        return;
    }
    const args = message.content.substring(1).split(" ");
    if (args[0] != "awbw") {
        return;
    }
    switch (args[1]) {
        case "register":
            if (args.length < 3) {
                message.channel.send("Not enough arguments!");
                return;
            }
            registerUser(message, args);
            break;
        case "unregister":
            unregisterUser(message, args);
            break;
        case "track":
            if (args.length < 3) {
                message.channel.send("Not enough arguments!");
                return;
            }
            await trackGame(message, args);
            break;
        case "check":
            if (gameList.length == 0) {
                message.channel.send("Not tracking any games!");
                return;
            }
            checkTurn(gameList[0]);
            break;
        case "help":
            message.channel.send(
                "Available commands: \n`!awbw register {username}` Associates your discord account with a AWBW username\n`!awbw unregister` removes previous association\n`!awbw track {gameId}` Start tracking AWBW with supplied id"
            );
            break;
        default:
            message.channel.send("Invalid usage!");
    }
    save();
};

exports.check = () => {
    gameList.forEach((id) => {
        try {
            checkTurn(id);
        } catch (e) {
            console.log(`Error checking game with id ${id}!`);
            console.log(e);
        }
    });
};
