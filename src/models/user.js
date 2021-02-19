const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
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
    avatar: String,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});


module.exports = mongoose.model('User', userSchema);