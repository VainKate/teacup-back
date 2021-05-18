const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const { User, Channel } = require("../models");
const authService = require('../services/auth.service');
const mailerService = require("../services/mailer.service");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET


const authController = {
    /**
     *
     * @param {string} req.body
     * @param {*} res
     * @returns
     */
    signup: async (req, res) => {
        try {
            const { email, nickname, password } = req.body;

            if (!email || !password || !nickname) {
                return res
                    .status(412)
                    .send(
                        "Missing information, you need to provide an email, a password and a nickname"
                    );
            }

            const emailExists = await User.findOne({
                where: {
                    email,
                },
            });

            if (emailExists) {
                return res
                    .status(409)
                    .send(
                        `Validation error: The mail address is invalid or already in use`
                    );
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                nickname,
            });

            return res.json(newUser);
        } catch (error) {
            return res.status(400).send(error.message);
        }
    },

    forgotPwd: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res
                    .status(412)
                    .send('An email must be provided');
            }
    
            const user = User.findOne({ where: { email } });
    
            if(!user){
                return res
                    .status(404)
                    .send('User not found')
            };
    
            await mailerService.test(email);
    
            res.status(200).send('Reset password mail has been sent.')

        } catch (error) {
            console.log(error)
            res.status(500).json(error !== 'Error' ?
                error :
                { message: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(412)
                    .send(
                        "Missing information, you need to provide an email and a password"
                    );
            }

            const user = await User.scope('withPassword').findOne({
                include: [
                    {
                        association: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                    {
                        association: "channels",
                        through: {
                            attributes: [],
                        },
                    },
                ],

                where: {
                    email,
                },
            });

            const isPasswordValid = user ?
                await bcrypt.compare(password, user.password) :
                false;

            if (!isPasswordValid) {
                return res.status(409).send(`Your credentials are invalid.`);
            }

            const recommendedChannels = await Channel.findAll({
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                    where: {
                        id: user.tags.map(({ id }) => id),
                    },
                },
            });

            user.recommendedChannels = recommendedChannels;

            const { accessToken, refreshToken } = await authService.generateTokens({ id: user.id });

            res.cookie("access_token", accessToken, {
                httpOnly: true
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true
            });

            res.status(200).json(user)

        } catch (error) {
            console.log(error)
            res.status(500).json(error.parent?.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    },

    logout: async (req, res) => {
        try {
            if (!req.cookies.access_token || !req.cookies.refresh_token) {
                return res.status(401).send('User is already logout')
            }

            const decoded = jwt.verify(req.cookies.access_token, JWT_SECRET, {
                ignoreExpiration: true
            })

            await authService.deleteRefreshToken(decoded.id, req.cookies.access_token);

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");

            res.status(200).send('Logout succeed');

        } catch (error) {
            res.status(401).json(error.name !== 'Error' ?
                error :
                {
                    "message": error.message
                })
        }

    }
};

module.exports = authController;