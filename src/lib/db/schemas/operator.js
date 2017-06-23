const mongoose = require('mongoose');
const uuid = require('uuid');
const objectId = mongoose.Schema.Types.ObjectId;
const sha1 = require('sha1');

const schema = mongoose.Schema({
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

schema.pre('save', function(next) {
    if (this.password) {
        this.password = sha1(this.password +  process.env.PASSWORD_SALT)
    }
    next();
});

module.exports = schema;