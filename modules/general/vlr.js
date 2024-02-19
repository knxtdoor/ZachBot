//VLR related scraping
const axios = require("axios");
const jsdom = require("jsdom");
const fs = require("fs");
const { indexOf } = require("lodash");
const { JSDOM } = jsdom;
const VLR = "https://vlr.gg";

async function fetchHimCandidates() {
    console.log("Fetching matches...");
    let response = (await axios.get(VLR + "/matches")).data;
    console.log("Matches retrieved");
    const currentDocument = new JSDOM(response).window.document;
    currentUpcomingMatches = [
        ...currentDocument.querySelectorAll(".match-item").values(),
    ];
    const currentMatches = currentUpcomingMatches.filter(
        (match) => match.querySelector(".mod-live") != null
    );

    response = (await axios.get(VLR + "/matches/results")).data;
    const oldDocument = new JSDOM(response).window.document;
    const dayLabels = oldDocument.querySelectorAll(".wf-label");
    const oneTagged = dayLabels[0].querySelector(".wf-tag") != null;
    const twoTagged = dayLabels[1].querySelector(".wf-tag") != null;
    let oldMatches = [];
    if (oneTagged) {
        oldMatches = [
            ...oldMatches,
            ...oldDocument
                .querySelectorAll(".wf-card")[1]
                .querySelectorAll(".match-item"),
        ];
    }

    if (twoTagged) {
        oldMatches = [
            ...oldMatches,
            ...oldDocument
                .querySelectorAll(".wf-card")[2]
                .querySelectorAll(".match-item"),
        ];
    }

    const allMatches = [...currentMatches, ...oldMatches];

    const t1Matches = allMatches.filter((match) => {
        const event = match
            .querySelector(".match-item-event")
            .childNodes[2].textContent.trim();
        return event.indexOf("Champions Tour 2024") != -1;
    });

    const matchLinks = t1Matches.map((match) => match.href);

    let allNames = (
        await Promise.all(
            matchLinks.map(async (link) => {
                // const link = matchLinks[0];
                const matchPage = (await axios.get(VLR + link)).data;
                const matchDOM = new JSDOM(matchPage).window.document;

                const statsPanel = [
                    ...matchDOM.querySelectorAll(".vm-stats-game"),
                ].find(
                    (statsPage) =>
                        statsPage.getAttribute("data-game-id") == "all"
                );
                const players = [...statsPanel.querySelectorAll(".mod-player")];
                const playerNames = players.map((player) =>
                    player
                        .querySelector("a")
                        .querySelector("div")
                        .textContent.trim()
                );
                return playerNames;
            })
        )
    ).flat();

    const outputObj = { time: new Date(), names: allNames };
    fs.writeFileSync(
        "./modules/general/himCandidates.json",
        JSON.stringify(outputObj)
    );
    console.log("Player data fetched.");
    return outputObj;
}

async function getHimData() {
    if (!fs.existsSync("./modules/general/himCandidates.json")) {
        console.log("No player data found. Retrieving...");
        return await fetchHimCandidates();
    }
    const data = JSON.parse(
        fs.readFileSync("./modules/general/himCandidates.json")
    );
    const timeSince = new Date() - new Date(data.time);
    const expired = timeSince / 1000 / 60 >= 10;
    if (expired) {
        console.log("Player data expired. Retrieving...");
    } else {
        console.log("Using saved player data.");
    }
    return expired ? await fetchHimCandidates() : data;
}

async function setHim(himName, message) {
    const data = await getHimData();
    if (data.names.indexOf(himName) == -1) {
        message.reply(`${himName} is not a valid Him candidate!`);
        return;
    }
    const himObj = { name: himName, time: new Date() };
    fs.writeFileSync("./modules/general/him.json", JSON.stringify(himObj));
    message.reply(`${himName} is Him.`);
}
async function getHim(message) {
    if (!fs.existsSync("./modules/general/him.json")) {
        message.reply("No player is Him.");
        return;
    }
    const himObj = JSON.parse(fs.readFileSync("./modules/general/him.json"));
    const himDuration = (new Date() - new Date(himObj.time)) / 1000;
    message.reply(
        `${himObj.name} is currently Him. He has been Him for ${himDuration} seconds.`
    );
}

exports.him = async (message, args) => {
    if (args[1] == "get") {
        getHim(message);
        return;
    } else if (args[1] == "set") {
        setHim(args[2], message);
        return;
    } else {
        message.reply(
            'Invalid him usage. Valid options are "get" and "set {player}". Player must have played in a VCT match in the past two days.'
        );
        return;
    }
};

async function fetchPickemData(pickemGroups) {
    const pickemPageLinks = pickemGroups.map(
        (group) =>
            `${VLR}/event/leaderboard/${group.eventID}/?group=${group.groupID}`
    );
    const scores = await Promise.all(
        pickemPageLinks.map(async (link) => {
            const groupPage = (await axios.get(link)).data;
            const groupPageDOM = new JSDOM(groupPage).window.document;
            const entryDivs = [
                ...groupPageDOM.querySelectorAll(".wf-module-item"),
            ];
            const entries = entryDivs.map((div) => {
                const score = parseInt(
                    div.children[0].textContent.trim().split()[0]
                );
                const username = div.children[2].children[0].textContent.trim();
                return { score, username };
            });
            return entries;
        })
    );
    return scores;
}

async function getEventName(eventID) {
    const page = (await axios.get(VLR + "/event/" + eventID)).data;
    const document = new JSDOM(page).window.document;
    return document.querySelector(".wf-title").textContent.trim();
}

async function addPickemGroup(message, args) {
    const eventID = args[2];
    const groupID = args[3];
    const eventName = await getEventName(eventID);
    const pickemObj = { eventName, eventID, groupID };
    let groups = [];
    if (fs.existsSync("./modules/general/pickemGroups.json")) {
        groups = JSON.parse(
            fs.readFileSync("./modules/general/pickemGroups.json")
        );
    }
    const dupe = groups.some((group) => group.groupID == groupID);
    if (dupe) {
        message.reply("This group has already been added!");
        return;
    }
    groups = [...groups, pickemObj];
    fs.writeFileSync(
        "./modules/general/pickemGroups.json",
        JSON.stringify(groups)
    );
    message.reply(`Added eventID ${eventID} groupID ${groupID}`);
}
async function getPickemScores(message) {
    if (!fs.existsSync("./modules/general/pickemGroups.json")) {
        message.reply(
            "No groups added. Add one with pickem add {eventID} {groupID}"
        );
        return;
    }
    const pickemGroups = JSON.parse(
        fs.readFileSync("./modules/general/pickemGroups.json")
    );
    if (pickemGroups == null || pickemGroups.length == 0) {
        message.reply(
            "No groups added. Add one with pickem add {eventID} {groupID}"
        );
        return;
    }
    const data = await fetchPickemData(pickemGroups);

    const response = data.reduce((prev, scoreSet, ndx) => {
        const head = `Pick'em scores for ${pickemGroups[ndx].eventName}:\n`;
        const body = scoreSet.reduce(
            (prevScore, score) =>
                prevScore + `> ${score.username}: ${score.score}\n`,
            ""
        );
        return prev + head + body;
    }, "");
    message.channel.send(response);
}
exports.pickem = async (message, args) => {
    if (args[1] == "scores") {
        await getPickemScores(message, args);
        return;
    } else if (args[1] == "add") {
        if (args.length != 4) {
            message.reply(
                "Invalid pickem usage. pickem add {event id} {group id}"
            );
        }
        await addPickemGroup(message, args);
        return;
    } else if (args[1] == "link") {
    } else {
        message.reply(
            'Invalid pickem usage. Valid options are "scores", "add", and "link".'
        );
        return;
    }
};
