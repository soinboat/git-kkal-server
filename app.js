require('dotenv').config();
const express = require('express');
const loaders = require('./loaders');
const errorHandler = require('./middlewares/invalidUrlHandler');
const invalidUrlHandler = require('./middlewares/errorHandler');

const repository = require('./routes/repository');

const app = express();

loaders(app, express);

app.use('/repository', repository);

invalidUrlHandler(app);
errorHandler(app);

module.exports = app;
