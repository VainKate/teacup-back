const { Router } = require("express");
const router = Router();

const { authController, channelController, tagController } = require("./controllers");


// [post] route for signup registration
router.post("/signup", authController.signup);

router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags', tagController.getAllTags);


module.exports = router;
