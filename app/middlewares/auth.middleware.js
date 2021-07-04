const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyJWT = async (req, res, next) => {

    const accessToken = req.cookies.access_token || null;
    const refreshToken = req.cookies.refresh_token || null;

    // check if both access & refresh token exists, otherwise, the user is not logged
    if (!accessToken && !refreshToken) {
        // throw new Error('No token found'); // OK
        return res.status(401).json({ message: 'No token found' })
    }

    // verify if the access token is conform
    jwt.verify(accessToken, JWT_SECRET, async (err, decodedAccessToken) => {
        try {
            if (!err && decodedAccessToken) {
                // if there is no error, the user id is saved and the access to the request is authorized
                req.userId = decodedAccessToken.id
                return next()
            };

            if (err.name !== 'TokenExpiredError') {
                // if there is any error other than the expiration of the token, the token is compromised
                throw err;
            };

            // if the token is valid but expired, we now verify the refresh token
            // try {
            const decoded = jwt.verify(refreshToken, JWT_SECRET)

            const { refreshToken: redisToken } = await authService.getRefreshToken(decoded.id, accessToken);

            // and compare it with the stored refresh token
            if (redisToken !== refreshToken) {
                // if they does not match, the user's refresh token is probably a hack attempt, the request is denied
                throw new Error("refresh token is invalid or expired");
            };

            // otherwise, the refresh token is valid, we can generate new access & refresh token and save the new refresh token in redis
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokens({ id: decoded.id }, accessToken);

            res.cookie("access_token", newAccessToken, authService.cookieOptions);

            res.cookie("refresh_token", newRefreshToken, authService.cookieOptions);

            // finally we save the user's id and authorize the request
            req.userId = decoded.id;
            next();
        }
        catch (error) {
            res.status(401).json(error.name !== 'Error' ?
                error :
                {
                    "message": error.message
                })
        }
    })
}

module.exports = verifyJWT;