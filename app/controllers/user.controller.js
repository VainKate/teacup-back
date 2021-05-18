const { User, Tag, Channel } = require("../models");

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
                return res.status(400).send("No user found.");
            }

            await user.update({ email, nickname });

            if (tags) {
                await user.setTags(tags);
            }

            await user.reload();

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error.parent.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    },

    updatePassword: async (req, res) => {
        // on récupère l'ancien mot de passe dans req.body
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        const id = req.userId;

        try {

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(400).send("No user found.");
            }

            const isOldPasswordValid = user ?
            await bcrypt.compare(password, user.password) :
            false;

        if (!isOldPasswordValid) {
            return res.status(409).send(`Please enter your old password, otherwise reset password`);
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        newPassword = await user.update({
            password: hashedPassword,
        });

        return res.status(200).json(`Password updated`);

        } catch (error) {
        res.status(500).json(error.parent.detail ?
            { message: error.parent.detail } :
            { message: error.message });
        }
    },

    delete: async (req, res) => {
        // store id in a const with incoming request parameters id
        const id = req.userId;
        try {
            // delete the user
            const deleted = await User.destroy({ where: { id } });

            if (deleted === 0) {
                return res.status(404).json({ message: 'This user does not exist or is already deleted' })
            }

            // send a 200 status and a message to show that user has been deleted
            res.status(200).send(`User account successfully deleted`);

        } catch (error) {
            res.status(500).json(error.parent.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    },

    profile: async (req, res) => {
        try {
            const user = await User.findByPk(req.userId,
                {
                    include: {
                        association: "tags",
                        through: {
                            attributes: []
                        }
                    }
                });

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error.parent?.detail ?
                { message: error.parent.detail } :
                { message: error.message });
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
                            attributes: []
                        },
                        attributes: [],
                        where: {
                            id
                        },
                        required: true
                    },
                    {
                        association: "tags",
                        through: {
                            attributes: []
                        },
                    }
                ]
            });

            res.status(200).json(channels);
        } catch (error) {
            res.status(500).json(error.parent?.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    },

    getRecommendedChannels: async (req, res) => {
        try {

            const recommendedChannels = await Channel.findAll({
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                    include: {
                        association: "users",
                        attributes: [],
                        through: {
                            attributes: []
                        },
                        where: {
                            id: req.userId,
                        },
                    },
                    required: true
                },
            });


            res.status(200).json(recommendedChannels);

        } catch (error) {
            res.status(500).json(error.parent?.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    }
};

module.exports = userController;
