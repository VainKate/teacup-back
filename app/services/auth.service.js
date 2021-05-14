const asyncClient = require('../redisClient');

const PREFIX = "teacup:";

const auth = {
    saveRefreshToken: async (userId, refreshTokenData) => {
        await asyncClient.set(`${PREFIX}user${userId}-refreshToken`, JSON.stringify(refreshTokenData));
    },

    getRefreshToken: async (userId) => {
        return await asyncClient.get(`${PREFIX}user${userId}-refreshToken`)
    },

    deleteRefreshToken: async (userId) => {
        await asyncClient.del(`${PREFIX}user${userId}-refreshToken`);
    }
};

module.exports = auth;