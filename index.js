require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const { Server } = require('socket.io');
const { createServer } = require('http')
const cors = require('cors')

const app = express();
const corsOptions = {
    // Ceci est du bricolage pour avoir un accès depuis toutes origines sans provoquer l'erreur si origin: '*', ça devrait fonctionner depuis le server par exemple.
    origin: (origin, callback) => {
        return callback(null, true)
    },
    // origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    // Indique que les tokens sont demandés dans la réponse
    credentials: true,
//     allowedHeaders: [
//         'Access-Control-Allow-Headers', 
//         'Origin', 
//         'X-Requested-With',
//         'Content-Type',
//         'Accept',
//     ],
}
app.use(cors(corsOptions));
app.use(cookieParser());

const httpServer = createServer(app);
const io = new Server(httpServer,
    {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: [
            'Access-Control-Allow-Headers', 
            'Origin', 
            'X-Requested-With',
            'Content-Type',
            'Accept',
        ],
    }
}
);

const apiRouter = require('./app/routes/router');
const socketHandler = require('./app/services/socket.handler');

const PORT = process.env.PORT || 8000;


app.use(express.json());
app.use('/v1', apiRouter);

io.on('connection', socket => {
    socketHandler.auth(socket, io);
    socketHandler.message(socket, io);
    socketHandler.disconnecting(socket, io);
})

httpServer.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));