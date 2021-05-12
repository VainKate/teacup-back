const { User, Channel, Tag } = require("../models");

module.exports = {
    update,
};

const { email, nickname, password } = req.body;

async function update(id) {
    const user = await getUser(id);

    // validate
    const nicknameChanged = nickname !== user.username;
    if (nicknameChanged && await User.findOne({ where: { nickname: nickname } })) {
        throw 'Username "' + nickname + '" is already taken';
    }

    // copy params to user and save
    Object.assign(user);
    await user.save();

    return(user.get());
}    
