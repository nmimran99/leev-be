const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const alertSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    parentItem: parent._id,
    scheduleId: '',
    startDate: '',
    interval: '',
    day: null,
    month: null,
    time: '',
    nextDate: '',
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);