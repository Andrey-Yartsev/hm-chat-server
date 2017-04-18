module.exports = function (server) {
    server.auth.strategy('operator', 'bearer-token-evotor', {
        validate: function (token, callback) {
            server.db.Operator.findOne({
                token: token
            }).then((operator) => {
                if (operator) {
                    callback(null, operator);
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
