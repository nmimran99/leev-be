const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    country: String,
    province: String,
    city: String,
    street: String,
    streetNumber: String,
    entrance: String,
    zipcode: String
})

const addInfoSchema = new Schema({
    floors: Number,
    floor: Number, 
    unit: Number,
    units: Number
})

const siteSchema = new Schema({
    address: addressSchema,
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    type: String,
    addInfo: addInfoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},

}, {
    timestamps: true
});

module.exports = mongoose.model('Site', siteSchema);