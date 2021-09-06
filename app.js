require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const loaders = require('./loaders');

const repository = require('./routes/repository');
const ERROR = require('./constants/error');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

loaders(app, express);

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use('/repository', repository);

app.use((req, res, next) => {
  next(createError(404, ERROR.PAGE_NOT_FOUND));
});

app.use(errorHandler);

module.exports = app;
