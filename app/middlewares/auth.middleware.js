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

    if (!accessToken && !refreshToken) { // || ou && ?
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

    jwt.verify(accessToken, jwtSecret, async (err, decoded) => {
        if (!err) {
            req.userId = decoded.id;
            next();
        };

        if (err && err.name !== 'TokenExpiredError') {
            return res.send('Invalid token')
        };

        console.log(decoded);

        const redisToken = await authService.getRefreshToken(decoded.id) || null;

        // TODO check exactly what's returned by redis in case of no token found
        console.log(!!redisToken);

        if (!redisToken || redisToken.refreshToken !== refreshToken) {
            return res.send('Well nope ?') // probable hacker
        };

        const { token, newRefreshToken } = await authService.generateTokens();

        // ? "__refresh_token" in the tutorial error ?
        res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true
        });

        // ? "__access_token" in the tutorial error ?
        res.cookie("access_token", token, {
            httpOnly: true
        });

        await authService.saveRefreshToken(user.id, newRefreshToken);

        req.userId = decoded.id;
        next();
    })
};

module.exports = verifyJWT;