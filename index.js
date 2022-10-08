const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
    let options = {};
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
            args: [
                ...chrome.args,
                "--hide-scrollbars",
                "--disable-web-security",
            ],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            devtools: true,
            ignoreHTTPSErrors: true,
        };
    }

    try {
        let browser = await puppeteer.launch(options);

        let page = await browser.newPage();
        await page.tracing.start({
            categories: ["devtools.timeline"],
        });

        await page.goto(
            "https://gisweb.casey.vic.gov.au/IntraMaps90/ApplicationEngine/frontend/mapbuilder/yourproperty.htm?configId=243fbf74-7d66-4208-899d-91b1d08ff8bf&liteConfigId=b2af2973-160e-4664-8e96-fe701aeaa67f&title=WW91ciBQcm9wZXJ0eSBhbmQgUGxhbm5pbmc%3D",
            { waitUntil: "load", timeout: 0 }
        );

        const tracing = JSON.parse(await page.tracing.stop());

        // get session information
        const events = tracing.traceEvents.filter(
            (te) =>
                te.name == "ResourceSendRequest" &&
                te.args.data.url !== undefined
        );

        for await (const event of events) {
            let eventUrl = event.args.data.url;
            if (
                eventUrl.includes("IntraMapsSession=") &&
                !eventUrl.includes("IntraMapsSession=null")
            ) {
                const substring = eventUrl.substring(
                    eventUrl.indexOf("IntraMapsSession=") + 17
                );
                console.log(substring);

                return res.status(200).send({
                    title: await page.title(),
                    session: substring,
                });
            }
        }

        // res.send({
        //     title: await page.title(),
        //     data: tracing,
        //     session: session,
        // });
    } catch (err) {
        console.error(err);
        return res.status(400).send(null);
    }
});

/* 
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.tracing.start({
        categories: ["devtools.timeline"],
        path: "tracing.json",
    });
    await page.goto(url, { waitUntil: "load", timeout: 0 });
    // await page.screenshot({ path: "example.png" });

    await page.tracing.stop();

    await browser.close();
*/

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});

module.exports = app;

// const express = require("express");
// const puppeteer = require("puppeteer");
// const tracingData = require("./tracing.json");
// const cors = require("cors");

// // require("./jobs");

// const app = express();
// app.use(cors());
// app.use(express.json());

// let url =
//     "https://gisweb.casey.vic.gov.au/IntraMaps90/ApplicationEngine/frontend/mapbuilder/yourproperty.htm?configId=243fbf74-7d66-4208-899d-91b1d08ff8bf&liteConfigId=b2af2973-160e-4664-8e96-fe701aeaa67f&title=WW91ciBQcm9wZXJ0eSBhbmQgUGxhbm5pbmc%3D";

// async function appStart() {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.tracing.start({
//         categories: ["devtools.timeline"],
//         path: "tracing.json",
//     });
//     await page.goto(url, { waitUntil: "load", timeout: 0 });
//     // await page.screenshot({ path: "example.png" });

//     await page.tracing.stop();

//     await browser.close();
// }

// app.get("/start_app", async (req, res) => {
//     try {
//         // await fs.unlinkSync("./tracing.json");
//         appStart();
//         res.status(200).send({ message: "App started" });
//     } catch (error) {
//         res.status(404).send({ message: "Some thing went wrong", error });
//     }
// });

// app.get("/token", async (req, res) => {
//     try {
//         const events = tracingData.traceEvents.filter(
//             (te) =>
//                 te.name == "ResourceSendRequest" &&
//                 te.args.data.url !== undefined
//         );

//         for await (const event of events) {
//             let eventUrl = event.args.data.url;
//             if (
//                 eventUrl.includes("IntraMapsSession=") &&
//                 !eventUrl.includes("IntraMapsSession=null")
//             ) {
//                 const substring = eventUrl.substring(
//                     eventUrl.indexOf("IntraMapsSession=") + 17
//                 );

//                 return res.status(200).send({
//                     status: true,
//                     message: "Session getting",
//                     token: substring,
//                 });
//             }
//         }

//         res.status(200).send({ status: false, message: "Session not getting" });
//     } catch (error) {
//         res.status(404).send({ message: "Some thing went wrong", error });
//     }
// });

// app.get("/", (req, res) => {
//     res.send({ message: "welcome" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log("Server listening on port", PORT));
