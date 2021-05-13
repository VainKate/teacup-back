const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const refreshTokenService = require('../services/refreshToken.service');

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = 60 * 5; // By security measures, we set jwtExpiration to a short time, 5 minutes here.
const jwtRefreshExpiration = 60 * 60 * 24 * 30; // duration of the refresh token, 30 days here

const verifyJWT = async (req, res, next) => {
    // const token = req.headers["x-access-token"];

    const accessToken = req.cookies.access_token || null;
    const refreshToken = req.cookies.refresh_token || null;

    if (!accessToken && !refreshToken) {
        return res.status(401).send('No token found');
    }

    jwt.verify(accessToken, jwtSecret, (err, decoded) => {
        if (err) {
            if (err.name !== 'TokenExpiredError') {
                return res.send('Invalid token')
            };

            const redisToken = await refreshTokenService.getRefreshToken(decoded.id) || null; // TODO check exactly what's returned by redis in case of no token found

            // ? redisToken.refreshToken === refreshToken in the tutorial, error ?
            if (!redisToken || redisToken.refreshToken !== refreshToken) {
                return res.send('Well nope ?') // probable hacker
            };

            const newRefreshToken = crypto.randomBytes(64).toString('base64');

            // ? "__refresh_token" in the tutorial error ?
            res.cookie("refresh_token", newRefreshToken, {
                // secure: true,
                httpOnly: true
            });

            const refreshTokenMaxAge = new Date() + jwtRefreshExpiration;

            await asyncClient.saveRefreshToken(decoded.id, {
                newRefreshToken,
                expires: refreshTokenMaxAge
            });

            const token = jwt.sign({ id: decoded.id }, jwtSecret, {
                expiresIn: jwtExpiration
            });

            // ? "__access_token" in the tutorial error ?
            res.cookie("access_token", token, {
                // secure: true,
                httpOnly: true
            });
        };

        req.userId = decoded.id;
        next();
    })
};

module.exports = verifyJWT;