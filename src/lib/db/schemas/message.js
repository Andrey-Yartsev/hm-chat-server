const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;
const uuid = require('uuid');

module.exports = mongoose.Schema({
    dt: {
        type: Date,
        default: Date.now
    },

    author: {
        type: objectId,
        required: true
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
