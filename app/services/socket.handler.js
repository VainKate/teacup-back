const { Channel, User } = require('../models');

const redis = require('redis');
const client = redis.createClient();

const PREFIX = 'teacup:'

const { promisify } = require('util');

const asyncClient = {
    exists: promisify(client.exists).bind(client),
    zadd: promisify(client.zadd).bind(client),
    zrange: promisify(client.zrange).bind(client),
    zrem: promisify(client.zrem).bind(client)
};

const socketHandler = {
    auth: (socket, io) => {
        socket.on('auth', async ({ channel, user }) => {
            /*
            {
                user : {
                    id : number,
                    nickname : string
                    alreadyJoined : boolean (not implemented yet)
                },
                channel : {
                    id : number
                },
                onlineUsers : [
                    {
                    id : number,
                    nickname : string
                },
                {
                    id : number,
                    nickname : string
                },
                etc
                ]
            }
            */
            const channelKey = `channel-${channel.id}`

            socket.join(channelKey);
            // Add the user to online users list of the channel

            // send confirmation to front that user had join the channel
            socket.emit('confirm');

            // key 'user-join' to tell front to add user to online user list
            // io.to(`channel-${channel.id}`).emit('user-join', { channel, user });

            await asyncClient.zadd(PREFIX + channelKey, user.id, user.nickname);
            const onlineUsers = await asyncClient.zrange(PREFIX + channelKey, 0, -1)

            console.log(onlineUsers)

            // Instead of just send the user that joined, send all users online.
            // ? Should user alone be send too ?
            io.to(`channel-${channel.id}`).emit('user-join', { channel, onlineUsers });

            // try {
            //     if (!user.alreadyJoined) {
            //         const channelJoined = await Channel.findByPk(channel.id);
            //         channelJoined.addUser(await User.findByPk(user.id));
            //     }
            // }

            // catch (err) {
            //     console.error(err);
            // }

        })
    },

    message: (socket, io) => {
        socket.on('message', message => {
            /*
            {
                id : string (messageId) (have to be send)
                user : {
                    id : number,
                    nickname : string
                }
                channel : {
                    id : number
                },
                content : string
            }
            */
            message.id = `${message.user.id}-${Date.now()}`

            io.to(`channel-${message.channel.id}`).emit('message', message);
        })
    },

    disconnecting: (socket, io) => {
        socket.on('disconnecting', async ({ channel, user }) => {
            console.log(socket.rooms)

            const channelKey = `channel-${channel.id}`;

            // key 'user-leave' to tell front to shift user from online user list to offline user list
            // io.to(channelKey).emit('user-leave', { channel, user });

            await asyncClient.zrem(PREFIX + channelKey, user.nickname);

            console.log("user disconnect");
            console.log(await asyncClient.zrange(PREFIX + channelKey, 0, -1));
        })
    }
};

module.exports = socketHandler;