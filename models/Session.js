const { default: mongoose } = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        token: String,
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
