const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: [true, "Email Should Be Unique"] },
    password: String,
    address: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
