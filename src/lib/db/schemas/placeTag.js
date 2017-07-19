const mongoose = require('mongoose');

module.exports = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  place: {
    type: String,
    required: true
  },
});