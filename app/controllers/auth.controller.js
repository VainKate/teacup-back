const { User, Channel } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// use the command underneath to generate a jwt secret key and then, store it your own .env
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
const jwtSecret = process.env.JWT_SECRET;
// ? should the other to be stored somewhere else ? in .env too ? a jwt config file ?
const jwtExpiration = 60 * 5; // By security measures, we set jwtExpiration to a short time, 5 minutes here.
const jwtRefreshExpiration = 60 * 60 * 24 * 30; // duration of the refresh token, 30 days here

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

            const userWithRecommendations = [{ user }, { recommendedChannels }];

            //! figure out how to generate_refresh_token
            const refreshToken = generate_refresh_token(64);
            const refreshTokenMaxAge = new Date() + jwtRefreshExpiration; // today's date + one month in seconds

            // Generate a new access token
            const token = jwt.sign({ uid: user.id }, jwtSecret, {
                expiresIn: jwtExpiration
            });

            /*
            According to youtube tutorial :
            req.session.user = {nickname : user.nickname, id : user.id, email : user.email} --? or-- user

            OR

            According to guidearea turotial :
            res.cookie("access_token", token, {
                // secure: true,
                httpOnly: true
            });
            res.cookie("refresh_token", refresh_token, {
                // secure: true,
                httpOnly: true
            });
            */


            // res.json(userWithRecommendations)
            res.json({auth : true, token, userWithRecommendations}) 

        } catch (error) {
            return res.status(400).send(error.message);
        }
    },
};

module.exports = authController;
