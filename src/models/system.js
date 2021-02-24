const mongoose = require('mongoose');
const Schema = mongoose.Schema;


    

const systemSchema = new Schema({
    name: String,
    asset: { type: Schema.Types.ObjectId, ref: 'Asset'},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    linkedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    data: {
        general: {
            location: String,
            manufacturingYear: String,
            SID: String,
        },
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
        insurance: {
            name: String,
            contactName: String,
            email: String,
            phoneNumber: String,
            extension: String,
            expiryDate: Date,
        },
        warranty: {
            issuer: String,
            expiryDate: Date
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('System', systemSchema);