const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const locationSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
    name: String,
    relatedUsers: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
    timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);