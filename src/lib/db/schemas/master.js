const mongoose = require('mongoose');
const uuid = require('uuid');

// master sessions
module.exports = mongoose.Schema({
  dt: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String,
    required: true,
    default: uuid.v4
  },
  login: {
    type: String,
    required: true
  }
});