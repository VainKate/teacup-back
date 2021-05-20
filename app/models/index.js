const { Model, Sequelize } = require("sequelize");
const sequelize = require('../database')

const Channel = require('./channel.model')(sequelize, Sequelize, Model);
const Tag = require('./tag.model')(sequelize, Sequelize, Model);
const User = require('./user.model')(sequelize, Sequelize, Model);

// ---------------------

Channel.belongsToMany(User, {
    foreignKey: 'channel_id',
    otherKey: 'user_id',
    as: 'channelUsers',
    through: 'user_has_channel'
});

User.belongsToMany(Channel, {
    foreignKey: 'user_id',
    otherKey: 'channel_id',
    as: 'userChannels',
    through: 'user_has_channel'
});

// ---------------------

User.belongsToMany(Tag, {
    foreignKey: 'user_id',
    otherKey: 'tag_id',
    as: 'userTags',
    through: 'user_has_tag'
});

Tag.belongsToMany(User, {
    foreignKey: 'tag_id',
    otherKey: 'user_id',
    as: 'tagUsers',
    through: 'user_has_tag'
});

// ---------------------

Tag.belongsToMany(Channel, {
    foreignKey: 'tag_id',
    otherKey: 'channel_id',
    as: 'tagChannels',
    through: 'channel_has_tag'
});

Channel.belongsToMany(Tag, {
    foreignKey: 'channel_id',
    otherKey: 'tag_id',
    as: 'channelTags',
    through: 'channel_has_tag'
});

module.exports = {
    sequelize,
    Channel,
    Tag,
    User
};