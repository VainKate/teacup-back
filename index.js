require('dotenv').config();

const express = require('express');

const { Server } = require('socket.io');
const { createServer } = require('http')
const cors = require('cors')

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Headers', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }
});

const apiRouter = require('./app/router');

const PORT = process.env.PORT || 8000;


app.use(express.json());
app.use('/v1', apiRouter);

let messageIndex = 0;

io.on('connection', socket => {
    socket.on('auth', ({ channel/*, user*/ }) => {
        /*
        {
            user : {
                id : number,
                nickname : string
            }
            channel : {
                id : number
            }
        }
        */

        socket.join(`channel-${channel.id}`);

        // socket.emit('confirm')

        // key 'user-join' to tell front to add user to user list
        // io.to(`channel-${message.channel.id}`).emit('user-join', {channel, user})
        // Channel.addUser(User.findByPk(user.id))
    })

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
        message.id = messageIndex++

        io.to(`channel-${message.channel.id}`).emit('message', message);
    })

    // socket.on('disconnect', ({ channel, user }) => {
    //     // key 'user-join' to tell front to add user to user list
    //     io.to(`channel-${channel.id}`).emit('user-leave', {channel, user});
    // })
})

httpServer.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));