const mongoose = require('mongoose');
const uuid = require('uuid');
const objectId = mongoose.Schema.Types.ObjectId;

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

    client: {
        type: objectId
    },

    operators: [{
        type: objectId
    }],

    description: {
        type: String
    }
});
