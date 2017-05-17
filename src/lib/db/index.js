'use strict';
const pino = require('logstash-pino-replace')();

const mongoose = require('mongoose');
mongoose.Promise = Promise;

const schemas = require('./schemas');
const db = mongoose.connection;

db.on('error', pino.error.bind(pino, 'connection error:'));

mongoose.connect(`mongodb://${process.env.MONGO_HOST}/chat-server`);

module.exports = function () {
    return new Promise((resolve, reject) => {
        db.once('open', () => {
            resolve({
                Client: mongoose.model('Client', schemas.client),
                Operator: mongoose.model('Operator', schemas.operator),
                Profile: mongoose.model('Profile', schemas.profile),
                Message: mongoose.model('Message', schemas.message),
                Line: mongoose.model('Line', schemas.line)
            });
        });
    });
};
