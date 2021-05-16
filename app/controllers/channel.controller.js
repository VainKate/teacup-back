const { Channel } = require("../models");
const usersStatus = require('../services/usersStatus.service');

const channelController = {
    getChannelById: async (req, res) => {
        try {
            const onlineList = await usersStatus.getOnlineList(`channel-${req.params.id}`);

            const channel = await Channel.findByPk(req.params.id, {
                include: {
                    association: 'users',
                    attributes: ['id', 'nickname','isLogged'],
                    through: {
                        attributes: []
                    }
                }
            });

            if (!channel) {
                return res.status(404).send('Channel not found')
            };

            for (const user of channel.users){
                user.isLogged = onlineList.includes(user.id.toString()) ? true : false;
            }

            return res.json(channel);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    },

    getAllChannels: async (_, res) => {
        try {
            const channels = await Channel.findAll({
                include : {
                    association : 'tags',
                    through : {
                        attributes : []
                    }
                }
            });

            return res.json(channels);
        }

        catch (err) {
            res.status(500).send(err.message);
        }
    }
}

module.exports = channelController;
