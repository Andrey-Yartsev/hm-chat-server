'use strict';
module.exports = function (server) {
    server.auth.scheme('bearer-token-evotor', require('./schema'));

    require('./strategies/client')(server);
    require('./strategies/operator')(server);
};
