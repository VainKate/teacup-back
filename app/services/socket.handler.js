const { Channel, User } = require('../models');

const socketHandler = {
    auth: (socket, io) => {
        socket.on('auth', async ({ channel, user }) => {
            /*
            {
                user : {
                    id : number,
                    nickname : string
                    -- prévoir un boolean alreadyJoined
                }
                channel : {
                    id : number
                }
            }
            */

            socket.join(`channel-${channel.id}`);
            socket.emit('confirm');

            // key 'user-join' to tell front to add user to user list
            io.to(`channel-${channel.id}`).emit('user-join', { channel, user });

            try {
                if (!user.alreadyJoined) {
                    const channelJoined = await Channel.findByPk(channel.id);
                    channelJoined.addUser(await User.findByPk(user.id));
                }
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
            message.id = `${message.user.id}-${new Date()}`

            io.to(`channel-${message.channel.id}`).emit('message', message);
        })
    },

    disconnect: (socket, io) => {
        socket.on('disconnect', ({ channel, user }) => {

            // key 'user-leave' to tell front to shift user from online user list to offline user list
            io.to(`channel-${channel.id}`).emit('user-leave', { channel, user });
        })
    }
};

module.exports = socketHandler;