const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir()
const Configuration = require("../../config.js");
const readLastLines = require('read-last-lines')

const vsLogFilePath = path.join(homedir, ".config/VintagestoryData/Logs/server-main.log")
const joinRegex = /Placing.(?<player>.*).at/
const leaveRegex = /Player.(?<player>.*).left/
let vsChannel = null

exports.name = "vintagestory"
exports.config = {}
exports.process = () => { }
exports.initialize = (client) => {
    vsChannel = client.channels.cache.get(Configuration.config.general.vsID);
    if (fs.existsSync(vsLogFilePath)) {
        let watchObject = fs.watch(vsLogFilePath, null, (eventType, filename) => {
            if (eventType == "change") {
                readLastLines.read(vsLogFilePath, 1).then(
                    (lines) => {
                        const joinResults = joinRegex.exec(lines);
                        const leaveResults = leaveRegex.exec(lines);
                        if (joinResults) {
                            playerName = joinResults.groups.player;
                            console.log()
                            vsChannel.send(
                                `${playerName} joined the VintageStory server!`
                            );

                        }
                        if (leaveResults) {
                            playerName = leaveResults.groups.player;
                            console.log(`${playerName} left!`)
                            vsChannel.send(
                                `${playerName} left the VintageStory server!`
                            );
                        }
                    }
                )
            }
        })
    }
}