const { Router } = require("express");
const router = Router();

const { authController, channelController, tagController } = require("./controllers");


// [post] route for signup registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get('/channels', channelController.getAllChannels);
router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags', tagController.getAllTags);
router.get('/tags/channels', tagController.getAllTagsWithChannels);


module.exports = router;
