const redis = require('redis');
const client = redis.createClient();

const PREFIX = 'teacup:'

const { promisify } = require('util');

const asyncClient = {
    sadd: promisify(client.sadd).bind(client),
    srem: promisify(client.srem).bind(client),
    smembers: promisify(client.smembers).bind(client),
    zadd: promisify(client.zadd).bind(client),
    zcount: promisify(client.zcount).bind(client),
    zrem: promisify(client.zrem).bind(client),
    zrange: promisify(client.zrange).bind(client),
    zscore: promisify(client.zscore).bind(client),
    zrangebyscore: promisify(client.zrangebyscore).bind(client),
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
    },

    addSocketToList: async (channelKey, socket, userId) => {
        await asyncClient.zadd(`${PREFIX + channelKey}-sockets`, userId, socket);

        return await asyncClient.zcount(`${PREFIX + channelKey}-sockets`, userId, userId);
    },

    removeSocketFromList : async (channelKey, socket) => {
        await asyncClient.zrem(`${PREFIX + channelKey}-sockets`, socket)
    },

    checkSockets : async (channelKey, socket) => {
        const userId = await asyncClient.zscore(`${PREFIX + channelKey}-sockets`, socket)

        const sockets = await asyncClient.zrangebyscore(`${PREFIX + channelKey}-sockets`, userId, userId, "WITHSCORES");

        return sockets;
    }
}

module.exports = usersStatus;