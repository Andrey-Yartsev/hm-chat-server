const pino = require('pino')();

process.on('unhandledRejection', (reason, p) => {
    pino.error(reason);
    pino.error(p);
});


require('babel-register');
require('./src/server.js')();
