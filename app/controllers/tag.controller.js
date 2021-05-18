const { Tag } = require('../models');

const tagController = {
    getAllTags: async (_, res) => {
        try {
            const tags = await Tag.findAll();

            res.json(tags)

        } catch (error) {
            const message = error.parent.detail || error.message
            res.status(500).json({ message });
        }
    },

    getAllTagsWithChannels: async (_, res) => {
        try {
            const tags = await Tag.findAll({
                include: {
                    association: 'channels',
                    through: {
                        attributes: []
                    }
                }
            });

            res.json(tags)

        } catch (error) {
            const message = error.parent.detail || error.message
            res.status(500).json({ message });
        }
    }
}

module.exports = tagController;