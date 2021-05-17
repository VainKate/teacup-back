const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyJWT = async (req, res, next) => {

    const accessToken = req.cookies.access_token || null;
    const refreshToken = req.cookies.refresh_token || null;

    try {
        if (!accessToken && !refreshToken) {
            throw new Error('No token found');
        }

        await jwt.verify(accessToken, JWT_SECRET, async (err, decodedAccessToken) => {
            if (!err && decodedAccessToken) {
                req.userId = decodedAccessToken.id
                return next()
            };

            if (err.name !== 'TokenExpiredError') {
                throw err;
            };


            const decoded = jwt.verify(refreshToken, JWT_SECRET)

            const { refreshToken: redisToken } = await authService.getRefreshToken(decoded.id);

            if (redisToken !== refreshToken) {
                throw new Error("refresh token is invalid or expired");
            };

            const { token, refreshToken: newRefreshToken } = await authService.generateTokens({ id: decoded.id });

            res.cookie("access_token", token, {
                httpOnly: true
            });

            res.cookie("refresh_token", newRefreshToken, {
                httpOnly: true
            });

            req.userId = decoded.id;
            next();
        })
    }

    catch (err) {
        res.status(401).json(err.name !== 'Error' ?
            err :
            {
                "message": err.message
            })
    }

};

module.exports = verifyJWT;