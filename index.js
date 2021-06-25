require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const { Server } = require('socket.io');
const { createServer } = require('http')
const cors = require('cors')

const app = express();
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ?
        [/teacup\.minervas\.space\/?$/] :
        [/localhost/],
    credentials: true
}

app.use([cors(corsOptions), cookieParser(), compression(), express.json()])

const httpServer = createServer(app);
const io = new Server(httpServer,
    {
        cors: {
            origin: corsOptions.origin,
            allowedHeaders: [
                'Access-Control-Allow-Headers',
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept'
            ],
        }
    }
);

const apiRouter = require('./app/routes/router');
const socketHandler = require('./app/services/socket.handler');

const PORT = process.env.PORT || 8000;

app.use('/v1', apiRouter);

io.on('connection', socket => {
    socketHandler.auth(socket, io);
    socketHandler.message(socket, io);
    socketHandler.disconnecting(socket, io);
})

httpServer.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));