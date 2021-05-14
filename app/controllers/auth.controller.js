const bcrypt = require("bcrypt");

const { User, Channel } = require("../models");
const authService = require('../services/auth.service');


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

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

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

            const isPasswordValid = user
                ? await bcrypt.compare(password, user.password)
                : false;

            if (!user || !isPasswordValid) {
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

            const { token, refreshToken } = await authService.generateTokens({id : user.id});

            res.cookie("access_token", token, {
                httpOnly: true
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true
            });

            await authService.saveRefreshToken(user.id, refreshToken);

            res.json(user)

        } catch (error) {
            return res.status(400).send(error.message);
        }
    },

    logout: async (req, res) => {
        // Can I get user id by the body ?
        await authService.deleteRefreshToken(req.userId);

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.redirect('/');
    }
};

module.exports = authController;
