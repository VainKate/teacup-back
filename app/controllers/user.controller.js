const { User, Tag, Channel } = require("../models");
const { Op, Sequelize } = require('sequelize');
const authService = require("../services/auth.service");

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const userController = {
    /**
     *
     * @param {json} req.body
     * @param {json} res.json
     * @returns
     */

    update: async (req, res) => {
        const id = req.userId;
        const { email, nickname, tags } = req.body;

        try {
            const options = tags
                ? {
                    include: {
                        association: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                }
                : null;

            const user = await User.findByPk(id, options);

            if (!user) {
                return res.status(400).json({ message: "No user found." });
            }

            await user.update({ email, nickname });

            if (tags) {
                await user.setTags(tags);
            }

            await user.reload();

            res.status(200).json(user);
        } catch (error) {
            const message = error.parent.detail || error.message;
            res.status(500).json({ message });
        }
    },

    updatePassword: async (req, res) => {
        // on récupère l'ancien mot de passe dans req.body
        const { password, newPassword } = req.body;

        if (!password || !newPassword) {
            return res
                .status(409)
                .json({ message: 'Current or new password is missing.' });
        }

        const id = req.userId;

        try {
            const user = await User.scope('withPassword').findByPk(id);
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res
                    .status(409)
                    .json({ message: 'The current password is incorrect' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

            user.password = hashedPassword;
            await user.save();

            await authService.deleteAllRefreshToken(id);

            res.clearCookie("access_token", authService.cookieOptions);
            res.clearCookie("refresh_token", authService.cookieOptions);

            return res.status(200).json({ message: 'Password updated' });
        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    delete: async (req, res) => {
        // store id in a const with incoming request parameters id
        const id = req.userId;
        try {
            // delete the user
            const deleted = await User.destroy({ where: { id } });

            if (deleted === 0) {
                return res
                    .status(404)
                    .json({
                        message:
                            "This user does not exist or is already deleted",
                    });
            }

            // send a 200 status and a message to show that user has been deleted
            res.status(200).json({
                message: `User account successfully deleted`,
            });
        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    profile: async (req, res) => {
        try {
            const user = await User.findByPk(req.userId, {
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                },
            });

            res.status(200).json(user);
        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    getUserChannels: async (req, res) => {
        const id = req.userId;

        try {
            const channels = await Channel.findAll({
                include: [
                    {
                        association: "users",
                        through: {
                            attributes: [],
                        },
                        attributes: [],
                        where: {
                            id,
                        },
                        required: true,
                    },
                    {
                        association: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                ],
            });

            res.status(200).json(channels);
        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    getRecommendedChannels: async (req, res) => {
        try {
            console.log('>>>>>>>>>>>START')

            const recommendedChannels = await Channel.findAll({
                attributes: ["id", "title", [Sequelize.fn("COUNT", Sequelize.col('channelUsers')), "usersCount"]],
                include: [
                    {
                        association: "channelUsers",
                        through: {
                            attributes: []
                        },
                        attributes: [],
                        group: ["channelUsers.id"]
                    }
                ],
                group: ["Channel.id"]
            })

        // const recommendedChannels = await Channel.findAll({
        //     include : [
        //         {
        //             association: "channelTags",
        //             through : {
        //                 attributes: []
        //             },
        //             include: {
        //                 association: "tagUsers",
        //                 through : {
        //                     attributes: []
        //                 },
        //                 attributes: ["id"],
        //                 required: true
        //             }
        //         },
        //         {
        //             association : 'channelUsers',
        //             through : {
        //                 attributes: []
        //             },
        //             attributes: ['id', [sequelize.fn('count', sequelize.col("channelUsers.id")), 'count']],
        //             group: ['Channel.id']
        //         }
        //     ],
        //     where : {
        //         "$channelTags->tagUsers.id$" : req.userId
        //     }
        // })

        res.status(200).json(recommendedChannels);
    } catch(error) {
        console.error(error)
        const message = error.parent?.detail || error.message
        res.status(500).json({ message });
    }
},
};

module.exports = userController;
