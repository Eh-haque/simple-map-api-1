const indexRouter = require("express").Router();
const { signUp, logIn } = require("../controllers/user");
const { body } = require("express-validator");
const { mapApi } = require("../controllers/address");

indexRouter.route("/signup").post(
    body("name").isLength({ min: 3 }),
    body("email").isEmail().normalizeEmail(),
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
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }),
        logIn
    );

indexRouter.route("/map_session").post(mapApi);

module.exports = indexRouter;
