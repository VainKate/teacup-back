const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authService = require('../services/auth.service');

const verifyJWT = async (req, res, next) => {

    const currentAccessToken = req.cookies.access_token || null;
    const currentRefreshToken = req.cookies.refresh_token || null;

    if (!currentAccessToken && !currentRefreshToken) {
        return res.status(401).send('Invalid token');
    }

    try {
        jwt.verify(currentAccessToken, jwtSecret, (err, decoded) => {
            if (!err) { 
                req.userId = decoded.id;
                return next();
            };

            if (err && err.name !== 'TokenExpiredError') {
                return res.status(401).send('Invalid token');
            };

            jwt.verify(currentRefreshToken, jwtSecret, async (err, decodedRefreshToken) => {
                const redisToken = await authService.getRefreshToken(decodedRefreshToken?.id) || null;

                if (err || !redisToken || JSON.parse(redisToken).refreshToken !== currentRefreshToken) {
                    return res.status(401).send('Invalid refresh token');
                };

                const { token, refreshToken } = await authService.generateTokens({ id: decodedRefreshToken.id });

                res.cookie("access_token", token, {
                    httpOnly: true
                });

                res.cookie("refresh_token", refreshToken, {
                    httpOnly: true
                });

                await authService.saveRefreshToken(decodedRefreshToken.id, refreshToken);

                req.userId = decodedRefreshToken.id;
                next();
            })
        })
    }

    catch (err) {
        res.status(400).send(err);
    }
};

module.exports = verifyJWT;