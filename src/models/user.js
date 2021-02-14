const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true,
        min: 8
    },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    birthDate: Date,
    createdBy: String,
    avatar: {
        data: Buffer,
        contentType: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);