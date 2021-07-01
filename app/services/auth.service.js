const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const asyncClient = require('../redisClient');


const PREFIX = "teacup:";
// use the command underneath to generate a jwt secret key and then, store it your own .env
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
const JWT_SECRET = process.env.JWT_SECRET;

const jwtExpiration = process.env.NODE_ENV === 'production' ?
    60 * 5 : 60;
const jwtRefreshExpiration = process.env.NODE_ENV === 'production' ?
    60 * 60 * 24 * 30 : 60 * 5;
const refreshTokenMaxAge = new Date() + jwtRefreshExpiration;

const resetKeyExpiration = process.env.NODE_ENV === 'production' ?
    60 * 60 * 24 : 120;

const auth = {
    cookieOptions: process.env.NODE_ENV === 'production' ?
        {
            httpOnly: true,
            secure: true,
            domain: 'api.teacup.minervas.space'
        } :
        {
            httpOnly: true,
        },

    generateTokens: async (payload, previousAccessToken) => {
        // generate both access & refresh token, sign them with JWT_SECRET and set an expiration value in seconds
        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtExpiration
        });
        const refreshToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtRefreshExpiration
        });

        // save the refresh token in redis
        await auth.saveRefreshToken(payload.id, accessToken, refreshToken, previousAccessToken);

        return { accessToken, refreshToken }
    },

    saveRefreshToken: async (userId, accessToken, refreshToken, previousAccessToken) => {
        // if a refresh token already exists, delete it to replace it by the new one
        if (previousAccessToken) {
            await asyncClient.del(`${PREFIX}refreshToken-user${userId}-${previousAccessToken}`);
        };

        // save the new refresh token in redis with an expiration value in timestamp
        await asyncClient.setex(`${PREFIX}refreshToken-user${userId}-${accessToken}`,
            jwtRefreshExpiration,
            JSON.stringify({
                refreshToken,
                expires: refreshTokenMaxAge
            }))
    },

    generateResetKey: async (payload, success) => {
        const resetKey = crypto.randomUUID();

        if (success) {
            await asyncClient.setex(`${PREFIX}resetPasswordKey-email${payload.email}`,
                jwtRefreshExpiration,
                JSON.stringify({
                    resetKey,
                    expires: new Date() + resetKeyExpiration
                }))
        };

        return { resetKey }
    },

    getResetKey: async (email) => {
        const resetKey = await asyncClient.get(`${PREFIX}resetPasswordKey-email${email}`);

        if (!resetKey) {
            throw new Error("refresh token is invalid or expired")
        };

        return JSON.parse(resetKey)
    },

    deleteResetKey: async (email) => {
        await asyncClient.del(`${PREFIX}resetPasswordKey-email${email}`);
    },

    getRefreshToken: async (userId, accessToken) => {
        const refreshToken = await asyncClient.get(`${PREFIX}refreshToken-user${userId}-${accessToken}`);

        if (!refreshToken) {
            throw new Error("refresh token is invalid or expired")
        };

        return JSON.parse(refreshToken)
    },

    deleteRefreshToken: async (userId, accessToken) => {
        await asyncClient.del(`${PREFIX}refreshToken-user${userId}-${accessToken}`);
    },

    deleteAllRefreshToken: async (userId) => {
        let cursor;
        let keys;
        const pattern = `${PREFIX}refreshToken-user${userId}-*`

        do {
            [cursor, keys] = await asyncClient.scan(cursor || 0, 'MATCH', pattern);
            await Promise.all(keys.map((key) => asyncClient.del(key)));
        } while (cursor !== '0');
    }
};

module.exports = auth;