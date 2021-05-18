const { Router } = require("express");
const router = Router();

const { authController, channelController, tagController, userController } = require("./controllers");


// [post] route for signup registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get('/channels', channelController.getAllChannels);
router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags', tagController.getAllTags);
router.get('/tags/channels', tagController.getAllTagsWithChannels);

// [put] route for update user
router.put('/users/:id(\\d+)', userController.update);

// [delete] route for delete user
router.delete('/users/:id(\\d+)', userController.delete);

// [get] route for my channels
router.get('/me/channels', userController.getUserChannels);

module.exports = router;