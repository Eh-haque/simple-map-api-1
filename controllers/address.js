let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

exports.mapApi = async (req, res, next) => {
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
            headless: true,
            devtools: true,
            // ignoreHTTPSErrors: true,
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

        // // get session information
        // const events = tracing.traceEvents.filter(
        //     (te) =>
        //         te.name == "ResourceSendRequest" &&
        //         te.args.data.url !== undefined
        // );

        // for await (const event of events) {
        //     let eventUrl = event.args.data.url;
        //     if (
        //         eventUrl.includes("IntraMapsSession=") &&
        //         !eventUrl.includes("IntraMapsSession=null")
        //     ) {
        //         const substring = eventUrl.substring(
        //             eventUrl.indexOf("IntraMapsSession=") + 17
        //         );
        //         console.log(substring);

        //         return res.status(200).send({
        //             title: await page.title(),
        //             session: substring,
        //         });
        //     }
        // }

        res.send({
            title: await page.title(),
            tracing: tracing,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).send(null);
    }
};
