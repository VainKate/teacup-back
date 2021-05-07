const { Channel } = require("../models");

const channelController = {
    getChannelById: async (req, res) => {
        try {
            const channel = await Channel.findByPk(req.params.id, {
                include: {
                    association: 'users',
                    attributes: ['id', 'nickname'],
                    through: {
                        attributes: []
                    }
                }
            });

            if (!channel) {
                return res.status(404).send('Channel not found')
            };

            return res.json(channel);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
}

module.exports = channelController;
