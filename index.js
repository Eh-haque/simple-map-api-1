const express = require("express");
const puppeteer = require("puppeteer");
const tracingData = require("./tracing.json");
const closest_match = require("closest-match");

require("./jobs");

const app = express();

// async function appStart() {
//     const browser = await puppeteer.launch({ devtools: true });
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

// app.post("/start_app", async (req, res) => {
//     try {
//         // await fs.unlinkSync("./tracing.json");
//         appStart();
//         res.status(200).send({ message: "App started" });

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
//     } catch (error) {
//         res.status(404).send({ message: "Some thing went wrong", error });
//     }
// });

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server listening on port", PORT));
