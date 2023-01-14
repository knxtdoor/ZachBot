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
  replyFunc = (inFile, outFile) => {
    command.channel
      .send({
        files: [
          {
            attachment: outFile,
            name: "df.jpg",
            description: "Deep-fried",
          },
        ],
      })
      .then(() => {
        fs.rm(inFile, () => {});
        fs.rm(outFile, () => {});
      });
  };
  //let image = command.attachments.find((attach)=>{attach.contentType.includes("image")})
  let url = command.attachments.at(0).url;
  let extension = url.substring(url.lastIndexOf("."), url.length);
  inFile = OUTPUT_DIR + Date.now() + "in" + extension;
  await downloadImage(url, inFile);
  imageCommands[args[1]](inFile, replyFunc, extension);
};

imageCommands = {
  df,
};

function df(inFile, reply, extension) {
  outFile = OUTPUT_DIR + Date.now() + "df" + extension;
  let replyFunc = () => {
    reply(inFile, outFile);
  };
  const image = sharp(inFile);
  image
    .metadata()
    .then((metadata) => {
      return image
        .jpeg({ quality: 1 })
        .resize({
          width: Math.trunc(metadata.width * 0.7),
          height: Math.trunc(metadata.height * 0.7),
          fit: "inside",
          kernel: "cubic",
        })
        .resize({
          width: metadata.width,
          height: metadata.height,
          fit: "inside",
          kernel: "lanczos2",
        })
        .modulate({ saturation: 5 })
        .toFile(outFile);
    })
    .then(replyFunc);
}
