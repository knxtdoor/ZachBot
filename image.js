sharp = require("sharp");

const fs = require("fs");
const axios = require("axios");

const OUTPUT_DIR = "./images/";

async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath));
  });
}

exports.manip = async (command, args) => {
  replyFunc = (fileName) => {
    command.channel.send(fileName);
  };
  //let image = command.attachments.find((attach)=>{attach.contentType.includes("image")})
  let url = command.attachments.at(0).url;
  let extension = url.substring(url.lastIndexOf("."), url.length);
  outFile = OUTPUT_DIR + Date.now() + "in" + extension;
  await downloadImage(url, outFile);
  imageCommands[args[1]](outFile, replyFunc, extension);
};

imageCommands = {
  df,
};

function df(image, reply, extension) {
  outFile = OUTPUT_DIR + Date.now() + "df" + extension;
  let replyFunc = () => {
    reply(outFile);
  };
  sharp(image)
    .modulate({ saturation: 2 })
    .jpeg({ quality: 1 })
    .toFile(outFile)
    .then(replyFunc);
}
