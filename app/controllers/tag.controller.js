const { Tag } = require('../models');

const tagController = {
    getAllTags: async (_, res) => {
        try {
            const tags = await Tag.findAll();

            res.json(tags)
        }

        catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

module.exports = tagController;