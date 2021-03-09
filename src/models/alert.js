const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const alertSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'} 
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);