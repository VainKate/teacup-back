const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const { User } = require("../models");
const authService = require('../services/auth.service');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET


const authController = {
    signup: async (req, res) => {
        try {
            const { email, nickname, password } = req.body;

            if (!email || !password || !nickname) {
                return res
                    .status(412)
                    .json({
                        message: "Missing information, you need to provide an email, a password and a nickname"
                    });
            }

            const emailExists = await User.findOne({
                where: {
                    email,
                },
            });

            if (emailExists) {
                return res
                    .status(409)
                    .json({
                        message: `Validation error: The mail address is invalid or already in use`
                    });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = await User.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                nickname,
            });

            return res.json(newUser);
        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(412)
                    .json({
                        message: "Missing information, you need to provide an email and a password"
                    });
            }

            const user = await User.scope('withPassword').findOne({
                include: [
                    {
                        association: "channels",
                        through: {
                            attributes: [],
                        },
                        include: "tags"
                    },
                ],

                where: {
                    email: email.toLowerCase(),
                },
            });

            const isPasswordValid = user ?
                await bcrypt.compare(password, user.password) :
                false;

            if (!isPasswordValid) {
                // if there is no user with this email address or if the provided password is incorrect, the same error is returned
                return res.status(401).json({
                    message: `Your credentials are invalid.`
                });
            }

            // if the login succeed, access & refresh tokens are generated ...
            const { accessToken, refreshToken } = await authService.generateTokens({ id: user.id });

            // and stored in httpOnly cookies.
            res.cookie("access_token", accessToken, authService.cookieOptions);
            res.cookie("refresh_token", refreshToken, authService.cookieOptions);

            // finally, the user's data are sent without his password
            res.status(200).json(user)

        } catch (error) {
            console.log(error)
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    logout: async (req, res) => {
        try {
            if (!req.cookies.access_token || !req.cookies.refresh_token) {
                return res.status(401).json({
                    message: 'User is already logout'
                })
            }

            const decoded = jwt.verify(req.cookies.access_token, JWT_SECRET, {
                ignoreExpiration: true
            })

            await authService.deleteRefreshToken(decoded.id, req.cookies.access_token);

            res.clearCookie("access_token", authService.cookieOptions);
            res.clearCookie("refresh_token", authService.cookieOptions);

            res.status(200).json({ message: 'Logout succeed' });

        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(400).json({ message });
        }
    }
};

module.exports = authController;