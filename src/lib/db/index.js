'use strict';

const mongoose = require('mongoose');
mongoose.Promise = Promise;

const schemas = require('./schemas');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

mongoose.connect(`mongodb://${process.env.MONGO_HOST}/helpme`);

module.exports = function () {
    return new Promise((resolve, reject) => {
        db.once('open', () => {
            resolve({
                Client: mongoose.model('Client', schemas.client),
                Operator: mongoose.model('Operator', schemas.operator),
                Message: mongoose.model('Message', schemas.message)
            });
        });
    });
};
