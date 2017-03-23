module.exports = function (server) {
    server.auth.strategy('client', 'bearer-token-evotor', {
        validate: function (token, callback) {
            server.db.Client.findOne({
                token: token
            }).then((client) => {
                if (client) {
                    callback(null, client);
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
