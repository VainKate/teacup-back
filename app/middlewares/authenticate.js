const jwtSecret = process.env.JWT_SECRET;

module.exports = verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        return res.status(401)
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.json({auth: false, message : "failed to authenticate"})
        }

        req.userId = decoded.id;

        next();
    })
};