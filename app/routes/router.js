const { Router } = require("express");
const router = Router();

const { authController } = require("../controllers");
const verifyJWT = require('../middlewares/auth.middleware');
const privateRoutes = require('./private.route');

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-pwd', authController.forgotPwd);
router.post('/reset-pwd', authController.resetPwd);

router.use(verifyJWT, privateRoutes);

module.exports = router;
