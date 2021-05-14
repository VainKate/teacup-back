const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const ErrorHandler = require('../helpers/error.helper');
const authService = require('../services/auth.service');

const verifyJWT = async (req, res, next) => {

    const currentAccessToken = req.cookies.access_token || null;
    const currentRefreshToken = req.cookies.refresh_token || null;

    if (!currentAccessToken && !currentRefreshToken) {
        return next(new ErrorHandler(400, 'No token found.'))
    }

    // TODO find where are going errors ? 

    try {
        jwt.verify(currentAccessToken, jwtSecret, (err, decoded) => {
            if (!err) { 
                req.userId = decoded.id;
                return next();
            };

            if (err && err.name !== 'TokenExpiredError') {
                return next(err);
            };

            jwt.verify(currentRefreshToken, jwtSecret, async (err, decodedRefreshToken) => {
                if (err) {
                    return next(err);
                }

                const redisToken = await authService.getRefreshToken(decodedRefreshToken.id) || null;

                if (!redisToken || JSON.parse(redisToken).refreshToken !== currentRefreshToken) {
                    return next(new ErrorHandler(400, 'Invalid token.'))
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
        next(err);
    }
};

module.exports = verifyJWT;