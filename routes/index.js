const indexRouter = require("express").Router();
const { signUp, logIn } = require("../controllers/user");
const { body } = require("express-validator");
const { mapApi, getToken } = require("../controllers/address");

indexRouter.route("/signup").post(
    body("name").isLength({ min: 3 }).withMessage("Please enter your name"),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter your email address"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Please enter a password at least 6 character"),
    // .isStrongPassword()
    // .withMessage(
    //     "Please enter a password at least 8 character and contain At least one uppercase, one lowercase, one special character.")
    signUp
);
indexRouter
    .route("/login")
    .post(
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter your email address"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Please enter your password"),
        logIn
    );

indexRouter.route("/map_session").get(mapApi);
indexRouter.route("/token").get(getToken);

module.exports = indexRouter;
