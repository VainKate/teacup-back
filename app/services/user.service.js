const { User, Channel, Tag } = require("../models");

module.exports = {
    update,
};

async function update(id, params) {
    
    const user = await getUser(id);

    // validate
    const nicknameChanged = params.nickname && user.nickname !== params.nickname;
    if (nicknameChanged && await User.findOne({ where: { nickname: params.nickname } })) {
        throw 'nickname "' + params.nickname + '" is already taken';
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return(user);
}    

// helper functions

async function getUser(id) {
    const user = await User.scope('withPassword').findOne({
        include: [
            {
                association: "tags",
                through: {
                    attributes: [],
                },
            },

        ],

        where: {
            id,
        },
    });
    if (!user) throw 'User not found';
    return user;
}