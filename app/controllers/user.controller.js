const { User } = require("../models");

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

    delete: async (req, res) => {
        // store id in a const with incoming request parameters id
        const id = parseInt(req.userId);
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
                        association : "tags",
                        through : {
                            attributes : []
                        }
                    }
                });

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error.parent.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    }
};

module.exports = userController;
