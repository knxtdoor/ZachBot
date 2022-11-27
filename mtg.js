const puppeteer = require("puppeteer");
exports.getCard = async (command, message) => {
  try {
    const cardName = command.slice(1, command.length).join(" ");
    message.channel.send("Generating card with name " + cardName + "...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://urzas.ai");
    await page.waitForSelector("#name-input", { timeout: 1000 });
    const inputDiv = await page.$("#name-input");
    const nameInput = await inputDiv.$("input");
    try {
      await nameInput.type(cardName);
    } catch (exception) {
      console.log(
        "Failed to type " + cardName + ". Probably invalid character"
      );
      message.channel.send("Generating " + cardName + " failed.");
    }
    await page.click("#action-button");
    await page
      .waitForNavigation({ timeout: 60000 })
      .then(async () => {
        const card = await page.evaluate(() => {
          return document.querySelector("#card-image").src;
        });
        message.channel.send(card);
      })
      .catch(() => {
        message.channel.send("Generation for card " + cardName + " timed out.");
      })
      .finally(async () => {
        await browser.close();
      });
  } catch (error) {
    console.log(error);
  }
};
