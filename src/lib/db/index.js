'use strict';
const pino = require('logstash-pino-replace')();

const mongoose = require('mongoose');
mongoose.Promise = Promise;

const schemas = require('./schemas');
const db = mongoose.connection;

const ucFirst = function (s) {
  return s.charAt(0).toUpperCase() + s.substr(1);
};

const normalizedPath = require('path').join(__dirname, 'schemas');

db.on('error', pino.error.bind(pino, 'connection error:'));

mongoose.connect(`mongodb://${process.env.MONGO_HOST}/chat-server`);

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.once('open', () => {
      const models = {};
      require('fs').readdirSync(normalizedPath).forEach(function (file) {
        let name = ucFirst(file.replace(/\.js$/, ''));
        models[name] = mongoose.model(name, require(normalizedPath + '/' + file));
      });
      resolve(models);
    });
  });
};
