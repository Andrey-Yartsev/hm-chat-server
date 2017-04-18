const mongoose = require('mongoose');
const uuid = require('uuid');
const objectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.Schema({
    dt: {
        type: Date,
        default: Date.now
    },

    login: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    token: {
        type: String,
        required: true,
        default: uuid.v4
    },

    invites: [{type: objectId, ref: 'Line'}],

    profile: {type: objectId, ref: 'Profile'}
});
