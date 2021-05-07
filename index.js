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
const socketHandler = require('./app/services/socket.handler');

const PORT = process.env.PORT || 8000;


app.use(express.json());
app.use('/v1', apiRouter);

let messageIndex = 0;

io.on('connection', socket => {
    socketHandler.auth(socket);
    socketHandler.message(socket, messageIndex);
})

httpServer.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));