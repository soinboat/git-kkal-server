const ERROR = require('../constants/errorConstants');

module.exports = (app) => {
  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
      error:
        req.app.get('env') === 'development'
          ? res.locals.message
          : ERROR.INTERNAL_SERVER_ERROR,
    });
  });
};
