const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { options } = require("../routes");

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.length > 0)
        return res
            .status(500)
            .send({ error: errors, message: "Parameters validation failed" });

    try {
        const payload = {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
        };

        res.send(payload);
    } catch (error) {
        res.status(404).send({
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
    if (errors.length > 0)
        return res
            .status(500)
            .send({ error: errors, message: "Parameters validation failed" });

    try {
        const checkUser = User.findOne({ email: req.body.email });
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
        res.status(404).send({
            error: error,
            message: "Something went wrong",
        });
    }
};
