const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'askdfj@skaldjf%klasdfjskmdaufanioerucmias;lkasfsadf';
const EXPIRES_IN = '7d';

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.errors.length > 0)
        return res.status(500).send({
            error: 'Parameters validation failed',
            message: errors.errors[0].msg,
        });

    try {
        const checkUser = await User.findOne({ email: req.body.email });
        if (checkUser) {
            return res.status(401).send({ message: 'User already exists' });
        } else {
            const payload = {
                name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
            };

            const user = new User(payload);

            const result = await user.save();

            if (result) {
                const jwtPayload = {
                    email: result.email,
                    _id: result._id,
                };
                const secretKey = SECRET_KEY;

                const token = jwt.sign(jwtPayload, secretKey, {
                    expiresIn: EXPIRES_IN,
                });

                return res
                    .status(200)
                    .send({ message: 'Signup successful', token: token });
            } else {
                return res
                    .status(401)
                    .send({ message: 'Something went wrong' });
            }
        }
    } catch (error) {
        next({
            error: error,
            message: 'Something went wrong',
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
        return res.status(500).send({
            error: 'Parameters validation failed',
            message: errors.errors[0].msg,
        });

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
                const secretKey = SECRET_KEY;

                const token = jwt.sign(payload, secretKey, {
                    expiresIn: EXPIRES_IN,
                });

                return res
                    .status(200)
                    .send({ message: 'Login successful', token: token });
            } else {
                return res.status(401).send({ message: 'Invalid password' });
            }
        } else {
            return res.status(401).send({ message: 'Invalid user' });
        }
    } catch (error) {
        next({
            error: error,
            message: 'Something went wrong',
        });
    }
};

exports.checkToken = async (req, res, next) => {
    try {
        const token = req.params.token;
        const secretKey = SECRET_KEY;

        const checkToken = jwt.verify(token, secretKey);
        if (!checkToken)
            return res
                .status(401)
                .send({ message: 'Token not valid', status: false });

        res.status(200).send({ message: 'Token  valid', status: true });
    } catch (error) {
        next({
            error: error,
            message: 'Something went wrong',
        });
    }
};
