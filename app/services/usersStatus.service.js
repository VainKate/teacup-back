const redis = require('redis');
const client = redis.createClient();

const PREFIX = 'teacup:'

const { promisify } = require('util');

const asyncClient = {
    sadd: promisify(client.sadd).bind(client),
    srem: promisify(client.srem).bind(client),
    smove: promisify(client.smove).bind(client),
    smembers: promisify(client.smembers).bind(client),
};

const usersStatus = {
    addToOnlineList: async (channelKey, userId) => {
        await asyncClient.sadd(`${PREFIX + channelKey}-online`, userId);
    },

    removeFromOnlineList: async (channelKey, userId) => {
        await asyncClient.srem(`${PREFIX + channelKey}-online`, userId)
    },

    getOnlineList: async (channelKey) => {
        const users = await asyncClient.smembers(`${PREFIX + channelKey}-online`)

        return users
    }
}

module.exports = usersStatus;