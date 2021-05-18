const { User, Tag, Channel } = require("../models");
const { QueryTypes } = require('sequelize');

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

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error.parent.detail ?
                { message: error.parent.detail } :
                { message: error.message });
        }
    },

    delete: async (req, res) => {
        // store id in a const with incoming request parameters id
        const id = parseInt(req.params.id);
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

    getUserChannels: async (req, res) => {
        // store id in a const with incoming request body id
        const id = parseInt(req.body.id);

        try {
            const channelIdsFromUser = await sequelize.query(
                `SELECT channel_id FROM public.channel_has_tag
                WHERE tag_id in 
                (SELECT "tags"."id" AS "tags.id" FROM "user" AS "User" LEFT OUTER JOIN 
                    ( "user_has_tag" AS "tags->user_has_tag" INNER JOIN "tag" AS "tags" 
                    ON "tags"."id" = "tags->user_has_tag"."tag_id") 
                ON "User"."id" = "tags->user_has_tag"."user_id" WHERE "User"."id" = ${id});`
                );

                console.log(channelIdsFromUser);
                
                const channels = Channel.findAll({
                    where: { id: channelIdFromUser },
                    include : {
                        association : 'tags',
                    }
                });

            if (!user) {
                return res.status(400).send("No user found.");
            }

            // send a 200 status and user's channels
            res.status(200).json(channels);

        } catch (error) {
            res.status(500).send('Error !!!!');
        }
    }
};

//    1            3            8           11      23
// Cuisine Variété française Mangas/Anime Action Réflexion

module.exports = userController;
