const jwt = require('jsonwebtoken');

const asyncClient = require('../redisClient');


const PREFIX = "teacup:";
// use the command underneath to generate a jwt secret key and then, store it your own .env
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
const JWT_SECRET = process.env.JWT_SECRET;

const jwtExpiration = process.env.NODE_ENV === 'production' ?
    60 * 5 : 15;
const jwtRefreshExpiration = process.env.NODE_ENV === 'production' ?
    60 * 60 * 24 * 30 : 30
const refreshTokenMaxAge = new Date() + jwtRefreshExpiration;

const auth = {
    generateTokens: async (payload) => {
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtExpiration
        });
        const refreshToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtRefreshExpiration
        });

        await auth.saveRefreshToken(payload.id, refreshToken);

        return { token, refreshToken }
    },

    saveRefreshToken: async (userId, refreshToken) => {
        await asyncClient.setex(`${PREFIX}user${userId}-refreshToken`,
            jwtRefreshExpiration,
            JSON.stringify({
                refreshToken,
                expires: refreshTokenMaxAge
            }));
    },

    getRefreshToken: async (userId) => {
        const refreshToken = await asyncClient.get(`${PREFIX}user${userId}-refreshToken`);

        if (!refreshToken) {
            throw new Error("refresh token is invalid or expired")
        };

        return JSON.parse(refreshToken)
    },

    deleteRefreshToken: async (userId) => {
        await asyncClient.del(`${PREFIX}user${userId}-refreshToken`);
    }
};

module.exports = auth;