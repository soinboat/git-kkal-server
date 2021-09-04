require('dotenv').config();
const express = require('express');
const loaders = require('./loaders');
const errorHandler = require('./middlewares/errorHandler');
const invalidUrlHandler = require('./middlewares/invalidUrlHandler');

const indexRouter = require('./routes/index');

const app = express();

loaders(app, express);

app.use('/', indexRouter);

errorHandler(app);
invalidUrlHandler(app);

module.exports = app;
