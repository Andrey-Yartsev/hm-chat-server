const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const sha1 = require('sha1');
const controllers = require('../controllers/operator');

const pino = require('logstash-pino-replace')();

module.exports = [
    {
        method: 'GET',
        path: '/testSend',
        handler: function(request, reply) {
            reply.file('./send.html');
        },
    }
];