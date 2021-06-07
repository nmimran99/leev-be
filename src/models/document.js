const mongoose = require('mongoose');
const { logChanges } = require('../logger/log.service');
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
    createdBy: Schema.Types.ObjectId,
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

documentSchema.pre('save', async function(next) {
    let doc = this;
    let newValue = await incrementCounter('documents');
    doc.docId = 'DOC-' + newValue.currentValue;
    next();
})

const Document = mongoose.model('Document', documentSchema);
    Document.watch([], { fullDocument: 'updateLookup' })
    .on('change', (data) => {
        logChanges(data);
})
module.exports = Document;



