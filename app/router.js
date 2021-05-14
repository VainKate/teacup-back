const { Router } = require("express");
const router = Router();

const { authController, channelController, tagController } = require("./controllers");
const verifyJWT = require('./middlewares/auth.middleware');


// [post] route for signup registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post('/logout', authController.logout);
// router.post('/profile', authController.profile);

router.get('/channel/:id(\\d+)', verifyJWT, channelController.getChannelById);

router.get('/tags', tagController.getAllTags);

router.use((error, req, res, next) => {
    res.send(error);
})


module.exports = router;
