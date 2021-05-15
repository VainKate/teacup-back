const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authService = require('../services/auth.service');

const verifyJWT = async (req, res, next) => {

    const accessToken = req.cookies.access_token || null;
    const refreshToken = req.cookies.refresh_token || null;

    if (!accessToken && !refreshToken) {
        return res.status(401).send('Invalid token');
    }

    jwt.verify(accessToken, jwtSecret, async (err, decodedAccessToken) => {
        if (!err && decodedAccessToken) {
            res.userId = decodedAccessToken.id
            return next()
        };

        if (err.name !== 'TokenExpiredError') {
            return next(err);
        };

        try {
            const decoded = jwt.verify(refreshToken, jwtSecret)

            const { refreshToken: redisToken } = await authService.getRefreshToken(refreshToken);

            if (redisToken !== refreshToken) {
                next(new Error("refresh token is invalid or expired"))
            };

            const { token, refreshToken : newRefreshToken } = await authService.generateTokens({ id: decoded.id });

            res.cookie("access_token", token, {
                httpOnly: true
            });

            res.cookie("refresh_token", newRefreshToken, {
                httpOnly: true
            });

            req.userId = decoded.id;
            next();
        }

        catch (err) {
            next(err)
        }
    });
};

module.exports = verifyJWT;