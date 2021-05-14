const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authService = require('../services/auth.service');

const verifyJWT = async (req, res, next) => {
    // const token = req.headers["x-access-token"];
    // console.log(req);
    // console.log(req.headers.cookie)

    const accessToken = req.cookies?.access_token || null;
    const refreshToken = req.cookies?.refresh_token || null;

    // console.log(req.headers.cookie)
    // console.log(req.headers.cookie.access_token)

    // const accessToken = req.headers.cookie?.access_token || null;
    // const refreshToken = req.headers.cookie?.refresh_token || null;

    if (!accessToken && !refreshToken) {
        console.log('pas de token')
        return res.status(401).send('No token found');
    }

    // const { err, decoded } = await jwt.verify(accessToken, jwtSecret);
    // if (!err) {
    //     req.userId = decoded.id;
    //     next();
    // }

    // if (err.name !== 'TokenExpiredError') {
    //     return res.status(401).send('Invalid Token');
    // }
    try {
        jwt.verify(accessToken, jwtSecret, async (err, decoded) => {
            if (!err) {
                console.log('access decoded ok')
                req.userId = decoded.id;
                return next();
            };

            if (err && err.name !== 'TokenExpiredError') {
                console.log('token invalid')
                return res.send('Invalid token')
            };

            const decodedRefreshToken = jwt.verify(refreshToken, jwtSecret);

            if (!decodedRefreshToken) {
                console.log('pas de decoded refresh token')
                return next('expired refresh token')
            }

            console.log(decodedRefreshToken)

            const redisToken = await authService.getRefreshToken(decodedRefreshToken.id) || null;

            if (!redisToken || redisToken.refreshToken !== refreshToken) {
                console.log('redis token invalid')
                return res.send('Well nope ?') // probable hacker
                // throw new Error('Invalid redis token')
            };

            const { token, newRefreshToken } = await authService.generateTokens(decodedRefreshToken.id);

            // ? "__refresh_token" in the tutorial error ?
            res.cookie("refresh_token", newRefreshToken, {
                httpOnly: true
            });

            // ? "__access_token" in the tutorial error ?
            res.cookie("access_token", token, {
                httpOnly: true
            });

            await authService.saveRefreshToken(decoded.id, newRefreshToken);

            req.userId = decoded.id;
            next();
        })
    }

    catch (err) {
        next(err)
    }
};

module.exports = verifyJWT;