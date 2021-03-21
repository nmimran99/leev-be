const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { incrementCounter } from '../services/counter.service';

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
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
    timestamps: true
});

faultSchema.pre('save', async function(next) {
    let fault = this;
    let newValue = await incrementCounter('faults');
    fault.faultId = 'FLT-' + newValue.currentValue;
    next();
})

module.exports = mongoose.model('Fault', faultSchema);

