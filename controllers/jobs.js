const schedule = require("node-schedule");
const Session = require("../models/Session");

let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  puppeteer = require("puppeteer");
  // chrome = require("chrome-aws-lambda");
  // puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

let options = {};
if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  options = {
    // args: [
    //     ...chrome.args,
    //     "--hide-scrollbars",
    //     "--disable-web-security",
    // ],
    // defaultViewport: chrome.defaultViewport,
    // executablePath: await chrome.executablePath,
    // headless: true,
    // devtools: true,
    // ignoreHTTPSErrors: true,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let browser;

// automated
exports.scheduleJob = schedule.scheduleJob("*/20 * * * *", async function (req, res, next) {
  try {
    if (browser === undefined) {
      console.log("Initializing Browser...");
      browser = await puppeteer.launch();
    } else {
      console.log("Re-using existing Browser...");
    }

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    // const title = await page.title();

    await page.tracing.start({
      categories: ["devtools.timeline"],
    });

    await page.goto(
      "https://gisweb.casey.vic.gov.au/IntraMaps22A/ApplicationEngine/frontend/mapbuilder/default.htm?configId=2c27b2b9-ee0e-49a8-9462-7085252fdff1&liteConfigId=e8c34f1d-21a3-4144-8926-a3f26ce07798&title=WW91ciUyMFByb3BlcnR5JTIwYW5kJTIwUGxhbm5pbmc=",
      { waitUntil: "load", timeout: 0 }
    );

    await sleep(10000);
    const tracing = JSON.parse(await page.tracing.stop());

    // get session information
    const events = tracing.traceEvents.filter((te) => te.name == "ResourceSendRequest" && te.args.data.url !== undefined);

    await context.close();
    await browser.close();
    browser = undefined;

    for await (const event of events) {
      let eventUrl = event.args.data.url;
      if (eventUrl.includes("IntraMapsSession=") && !eventUrl.includes("IntraMapsSession=null")) {
        const substring = eventUrl.substring(eventUrl.indexOf("IntraMapsSession=") + 17);

        await Session.updateOne({ _id: "63476183533fdef5769ffe55" }, { token: substring });

        return;
      }
    }
  } catch (error) {
    console.error(error);

    await context.close();
    await browser.close();
    browser = undefined;
  }
});
