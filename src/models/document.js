const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { incrementCounter } = require('../services/counter.service');

const documentSchema = new Schema({
    docId: String,
    description: String,
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null },
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', default: null },
    system: { type: Schema.Types.ObjectId, ref: 'System', default: null },
    fault: { type: Schema.Types.ObjectId, ref: 'Fault', default: null }, 
    task: { type: Schema.Types.ObjectId, ref: 'Task', default: null }, 
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: String,
    url: String,
    createdBy: Schema.Types.ObjectId
}, {
    timestamps: true
});

documentSchema.pre('save', async function(next) {
    let doc = this;
    let newValue = await incrementCounter('documents');
    doc.docId = 'DOC-' + newValue.currentValue;
    next();
})

module.exports = mongoose.model('Document', documentSchema);

