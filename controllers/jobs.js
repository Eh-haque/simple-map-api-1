const schedule = require('node-schedule');
const Session = require('../models/Session');

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    puppeteer = require('puppeteer');
    // chrome = require("chrome-aws-lambda");
    // puppeteer = require("puppeteer-core");
} else {
    puppeteer = require('puppeteer');
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

let browser;
async function myFunction() {
    return (browser = await puppeteer.launch());
}
myFunction();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// automated
exports.scheduleJob = schedule.scheduleJob('*/20 * * * *', async function () {
    try {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        // const title = await page.title();

        await page.tracing.start({
            categories: ['devtools.timeline'],
        });

        await page.goto(
            'https://gisweb.casey.vic.gov.au/IntraMaps90/ApplicationEngine/frontend/mapbuilder/yourproperty.htm?configId=243fbf74-7d66-4208-899d-91b1d08ff8bf&liteConfigId=b2af2973-160e-4664-8e96-fe701aeaa67f&title=WW91ciBQcm9wZXJ0eSBhbmQgUGxhbm5pbmc%3D',
            { waitUntil: 'load', timeout: 0 }
        );

        await sleep(10000);
        const tracing = JSON.parse(await page.tracing.stop());

        // get session information
        const events = tracing.traceEvents.filter(
            (te) =>
                te.name == 'ResourceSendRequest' &&
                te.args.data.url !== undefined
        );

        for await (const event of events) {
            let eventUrl = event.args.data.url;
            if (
                eventUrl.includes('IntraMapsSession=') &&
                !eventUrl.includes('IntraMapsSession=null')
            ) {
                const substring = eventUrl.substring(
                    eventUrl.indexOf('IntraMapsSession=') + 17
                );

                const result = await Session.updateOne(
                    { _id: '63476183533fdef5769ffe55' },
                    { token: substring }
                );

                if (result.modifiedCount > 0) {
                    return res.status(200).send({
                        session: substring,
                        result: 'session updated successfully',
                    });
                } else {
                    return res.status(400).send({
                        session: substring,
                        result: "session isn't updated successfully",
                    });
                }
            }
        }

        await context.close();
    } catch (error) {
        console.error(err);
        return res.status(400).send(error);
    }
});
