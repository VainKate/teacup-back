const { Channel, User } = require('../models');
const usersStatus = require('./usersStatus.service');

const socketHandler = {
    auth: (socket, io) => {
        socket.on('auth', async ({ channel, user }) => {
            /*
            {
                user : {
                    id : number,
                    nickname : string
                    alreadyJoined : boolean (not implemented yet) -- to get this information, front should browse through offline lists to seek if user is in it
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
            const channelKey = `channel-${channel.id}`;
            // const userKey = `user${user.id}-${user.nickname}`

            // console.log('before join', socket.rooms);

            socket.join(channelKey);

            console.log('after join', socket.rooms);

            // send confirmation to front that user had join the channel
            socket.emit('confirm');

            // key 'user-join' to tell front to add user to online user list
            io.to(`channel-${channel.id}`).emit('user-join', { channel, user });

            try {
                if (!user.alreadyJoined) {
                    // const channelJoined = await Channel.findByPk(channel.id);
                    // channelJoined.addUser(await User.findByPk(user.id));

                } 
                await usersStatus.addToOnlineList(channelKey, user.id);
            }

            catch (err) {
                console.error(err);
            }

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
            // console.log('on disconnecting', socket.rooms)
            // const userKey = `user${user.id}-${user.nickname}`

            const channelKey = [...socket.rooms][1];

            console.log(socket.rooms)
            console.log(socket.id)

            await usersStatus.removeFromOnlineList(channelKey, '1')

            // key 'user-leave' to tell front to shift user from online user list to offline user list
            // io.to(channelKey).emit('user-leave', { channel, user });

            // try {
            //     await usersStatus.switchUserStatus(channelKey, userKey, 'offline');

                console.log("user disconnect");
            // }

            // catch (err) {
            //     console.error(err);
            // }

        })
    }
};

module.exports = socketHandler;