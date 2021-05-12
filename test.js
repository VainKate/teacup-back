const {User, Channel, Tag} = require('./app/models');

(async () => {
    // const user = await User.findByPk(51)

    // await user.addTag(await Tag.findAll({
    //     limit : 6
    // }))

    // await user.addChannel(await Channel.findAll({
    //     limit : 6
    // }))
    console.log(await User.findAll())
})()