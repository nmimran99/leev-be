const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    reportId: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    name: String,
    parameters: Object
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);

