const mongoose = require('mongoose');
const uuid = require('uuid');
const objectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    avatar: {
        type: String
    }
});
