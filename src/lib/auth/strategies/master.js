module.exports = function (server) {
  server.auth.strategy('master', 'bearer-token-evotor', {
    validate: function (token, callback) {
      server.db.Master.findOne({
        token: token
      }).then((master) => {
        if (master) {
          callback(null, master);
        } else {
          callback('Incorrect token');
        }
      }).catch((err) => {
        server.logger.error(err);
        callback('Db error');
      });
    }
  });
};
