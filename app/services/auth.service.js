const jwt = require('jsonwebtoken');

const asyncClient = require('../redisClient');

// use the command underneath to generate a jwt secret key and then, store it your own .env
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = 60 * 5; // By security measures, we set jwtExpiration to a short time, 5 minutes here.
const jwtRefreshExpiration = 60 * 60 * 24 * 30; // duration of the refresh token, 30 days here
const refreshTokenMaxAge = new Date() + jwtRefreshExpiration; // today's date + one month in seconds

const PREFIX = "teacup:";

const auth = {
    generateTokens: async (payload) => {
        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: jwtExpiration
        });
        const refreshToken = jwt.sign(payload, jwtSecret, {
            expiresIn: jwtRefreshExpiration
        });

        return { token, refreshToken }
    },

    saveRefreshToken: async (userId, refreshToken) => {
        await asyncClient.set(`${PREFIX}user${userId}-refreshToken`, JSON.stringify({
            refreshToken,
            expires : refreshTokenMaxAge
        }));
    },

    getRefreshToken: async (userId) => {
        return await asyncClient.get(`${PREFIX}user${userId}-refreshToken`)
    },

    deleteRefreshToken: async (userId) => {
        await asyncClient.del(`${PREFIX}user${userId}-refreshToken`);
    }
};

module.exports = auth;