const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { incrementCounter } from '../services/counter.service';
import { createNotification } from '../services/notification.service';

const faultSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    faultId: String,
    title: String,
    description: String,
    location: String,
    asset: { type: Schema.Types.ObjectId, ref: 'Asset'},
    system: { type: Schema.Types.ObjectId, ref: 'System'},
    following: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    status: { type: Schema.Types.ObjectId, ref: 'StatusList'},
    images: [],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

faultSchema.pre('save', async function(next) {
    let fault = this;
    let newValue = await incrementCounter('faults');
    fault.faultId = 'FLT-' + newValue.currentValue;
    next();
})

const Fault = mongoose.model('Fault', faultSchema);
Fault.watch([], { fullDocument: 'updateLookup' })
.on('change', (data) => {
    createNotification(data);
})
module.exports = Fault;


