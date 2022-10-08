// const schedule = require("node-schedule");
// const Puppeteer = require("puppeteer");
// const fs = require("fs");

// let url =
//     "https://gisweb.casey.vic.gov.au/IntraMaps90/ApplicationEngine/frontend/mapbuilder/yourproperty.htm?configId=243fbf74-7d66-4208-899d-91b1d08ff8bf&liteConfigId=b2af2973-160e-4664-8e96-fe701aeaa67f&title=WW91ciBQcm9wZXJ0eSBhbmQgUGxhbm5pbmc%3D";

// schedule.scheduleJob("*/30 * * * *", async function () {
//     await fs.unlinkSync("./tracing.json");

//     const browser = await Puppeteer.launch({ devtools: true });
//     const page = await browser.newPage();
//     await page.tracing.start({
//         categories: ["devtools.timeline"],
//         path: "tracing.json",
//     });
//     await page.goto(url, { waitUntil: "load", timeout: 0 });
//     // await page.screenshot({ path: "example.png" });

//     await page.tracing.stop();

//     await browser.close();
// });

// vercel
/* 
{
    "version": 2,
    "builds": [
      {
        "src": "./index.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/"
      }
    ]
  }
*/
