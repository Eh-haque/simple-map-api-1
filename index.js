const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes/index");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("welcome to map api");
});

// routes
app.use("/", indexRouter);

//resource not found
app.use(function (req, res, next) {
    next({ error: "Route not found" });
});

// default error handler
app.use(function (err, req, res, next) {
    if (res.headersSent) {
        next("There was an error sending the request");
    } else {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(500).send("Internal server error");
        }
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

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started");
});

module.exports = app;
