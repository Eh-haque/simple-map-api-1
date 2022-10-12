const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.errors.length > 0)
        return res
            .status(500)
            .send({ error: errors.errors[0].msg, message: "Parameters validation failed" });

    try {
        const checkUser = User.findOne({ email: req.body.email });
        if (checkUser)
            return res.status(401).send({ message: "User already exists" });

        const payload = {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
        };

        const user = new User(payload);

        const result = await user.save();
        if (!result)
            return res.status(401).send({ message: "Something went wrong" });

        res.status(200).send({ message: "Sign up successful", user: result });
    } catch (error) {
        next({
            error: error,
            message: "Something went wrong",
        });
    }
};

/**
 *
 * @param {email, password} req
 * @param {token} res
 * @param {error} next
 * @returns
 */
exports.logIn = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.errors.length > 0)
        return res
            .status(500)
            .send({ error: errors.errors[0].msg, message: "Parameters validation failed" });

    try {
        const checkUser = await User.findOne({ email: req.body.email });
        if (checkUser) {
            const checkPassword = bcrypt.compareSync(
                req.body.password,
                checkUser.password
            );
            if (checkPassword) {
                const payload = {
                    email: checkUser.email,
                    _id: checkUser._id,
                };
                const secretKey =
                    "askdfj@skaldjf%klasdfjskmdaufanioerucmias;lkasfsadf";

                const token = jwt.sign(payload, secretKey, {
                    expiresIn: "30d",
                });

                return res
                    .status(200)
                    .send({ message: "Login successful", token: token });
            } else {
                return res.status(401).send({ message: "Invalid password" });
            }
        } else {
            return res.status(401).send({ message: "Invalid user" });
        }
    } catch (error) {
        next({
            error: error,
            message: "Something went wrong",
        });
    }
};
