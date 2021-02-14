const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const additionalDetails = new Schema({
    location: String,
    manufacturer: {
        name: String,
        contactName: String,
        email: String,
        phoneNumber: String,
        extension: String, 
    },
    supplier: {
        name: String,
        contactName: String,
        email: String,
        phoneNumber: String,
        extension: String,
    },
    manufacturingYear: String,
    SID: String,
    insurance: {
        hasInsurance: Boolean,
        provider: String,
        email: String,
        phoneNumber: String,
        extension: String,
        expiryDate: Date,
    },
    warranty: {
        hasWarranty: Boolean,
        isManufacturer: Boolean,
        isSupplier: Boolean,
        warrantyExpiry: Date
    }

})

const systemSchema = new Schema({
    name: String,
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    linkedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    data: additionalDetails
}, {
    timestamps: true
});

module.exports = mongoose.model('System', systemSchema);