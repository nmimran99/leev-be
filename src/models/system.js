const mongoose = require('mongoose');
const { logChanges } = require('../logger/log.service');
const Schema = mongoose.Schema;


    

const systemSchema = new Schema({
    name: String,
    asset: { type: Schema.Types.ObjectId, ref: 'Asset'},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    relatedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
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
    },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const System = mongoose.model('System', systemSchema);
System.watch([], { fullDocument: 'updateLookup' })
.on('change', (data) => {
    logChanges(data);
})
module.exports = System;
