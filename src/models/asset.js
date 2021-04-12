const mongoose = require('mongoose');
const Schema = mongoose.Schema;





const assetSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    address: {
        country: String,
        province: String,
        city: String,
        street: String,
        streetNumber: String,
        entrance: String,
        zipcode: String
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    type: String,
    addInfo: {
        floors: Number,
        floor: Number, 
        unit: Number,
        units: Number
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    coordinates: {}
}, {
    timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);