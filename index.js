require('dotenv').config();

const pino = require('logstash-pino-replace')();

process.on('unhandledRejection', (reason, p) => {
    console.error(reason);
    console.error(p);
});

require('babel-register');
require('./src/server.js')();
