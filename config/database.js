const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const options = {
            // autoIndex: false, // Don't build indexes
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            // family: 4 // Use IPv4, skip trying IPv6
        };

        mongoose.connect(process.env.MONGO_URI, options, function (error) {
            if (error) {
                console.log("Error connecting to Mongoose: " + error);
            } else {
                console.log("Connected to Mongoose");
            }
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectDB;
