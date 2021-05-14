const { User, Channel, Tag } = require("../models");

const userController = {
    /**
     *
     * @param {json} req.body
     * @param {json} res.json
     * @returns
     */

    update: async (req, res) => {
        const id = req.params.id;
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

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // delete must only be used if the id exists !
    delete: async (req, res) => {
        // store id in a const with incoming request parameters id
        const id = parseInt(req.params.id);
        try {
            const user = await User.findByPk(id);
            // delete the user
            await user.destroy({ where: { id } });
            // send a 200 status and a message to show that user has been deleted
            res.status(200).send(`User ${user.nickname} has benn suppressed`);
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: error.message });
        }
    },
};

module.exports = userController;
