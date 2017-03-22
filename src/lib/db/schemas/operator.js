const mongoose = require('mongoose');
const uuid = require('uuid');

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

    name: {
        type: String,
        required: true
    }
});
