const { Router } = require("express");
const router = Router();

const { channelController, tagController, userController } = require("../controllers");

router.get('/me', userController.profile)
// [put] route for update user
router.put('/me', userController.update);
// [delete] route for delete user
router.delete('/me', userController.delete);

router.get('/channels', channelController.getAllChannels);
router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags/channels', tagController.getAllTagsWithChannels);

module.exports = router;