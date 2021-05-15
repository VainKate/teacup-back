const { Router } = require("express");
const router = Router();

const { channelController, tagController } = require("../controllers");

router.get('/channels', channelController.getAllChannels);
router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags/channels', tagController.getAllTagsWithChannels);

module.exports = router;