const createError = require('http-errors');
const ERROR = require('../constants/error');

module.exports = (app) => {
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404, ERROR.PAGE_NOT_FOUND));
  });
};
