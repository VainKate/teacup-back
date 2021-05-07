const express = require('express');
const app = express();
require('dotenv').config();

const apiRouter = require('./app/router');

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use('/v1', apiRouter);

app.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));