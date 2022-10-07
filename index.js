const express = require("express");
const puppeteer = require("puppeteer");
const tracingData = require("./tracing.json");
const closest_match = require("closest-match");
const fs = require("fs");
require("./jobs");

const app = express();

let url =
    "https://gisweb.casey.vic.gov.au/IntraMaps90/ApplicationEngine/frontend/mapbuilder/yourproperty.htm?configId=243fbf74-7d66-4208-899d-91b1d08ff8bf&liteConfigId=b2af2973-160e-4664-8e96-fe701aeaa67f&title=WW91ciBQcm9wZXJ0eSBhbmQgUGxhbm5pbmc%3D";

async function appStart() {
    const browser = await puppeteer.launch({ devtools: true });
    const page = await browser.newPage();
    await page.tracing.start({
        categories: ["devtools.timeline"],
        path: "tracing.json",
    });
    await page.goto(url, { waitUntil: "load", timeout: 0 });
    // await page.screenshot({ path: "example.png" });

    await page.tracing.stop();

    await browser.close();
}

app.post("/start_app", async (req, res) => {
    try {
        // await fs.unlinkSync("./tracing.json");
        appStart();
        res.status(200).send({ message: "App started" });

        // const browser = await puppeteer.launch({ devtools: true });
        // const page = await browser.newPage();
        // await page.tracing.start({
        //     categories: ["devtools.timeline"],
        //     path: "tracing.json",
        // });
        // await page.goto(url);
        // // await page.screenshot({ path: "example.png" });

        // await page.tracing.stop();

        // await browser.close();
    } catch (error) {
        res.status(404).send({ message: "Some thing went wrong", error });
    }
});

app.get("/", async (req, res) => {
    try {
        const events = tracingData.traceEvents.filter(
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
                console.log(eventUrl);
                const substring = eventUrl.substring(
                    eventUrl.indexOf("IntraMapsSession=") + 17
                );

                return res
                    .status(200)
                    .send({ message: "Session getting", token: substring });
            }
        }
        // events.forEach((event) => {});

        res.status(200).send({ message: "Session not getting" });
    } catch (error) {
        res.status(404).send({ message: "Some thing went wrong", error });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log("Server listening on port", PORT));
