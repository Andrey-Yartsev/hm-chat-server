const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;
const uuid = require('uuid');

module.exports = mongoose.Schema({
    dt: {
        type: Date,
        default: Date.now
    },

    author: {
        type: objectId,
        ref: 'Profile'
    },

    client: objectId,

    line: objectId,

    text: {
        type: String,
        required: true
    }
});
