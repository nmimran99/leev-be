const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tenantSchema = new Schema({
    name: String,
    contactName: String,
    contactNumber: String,
    lang: String,
    isActive: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);

