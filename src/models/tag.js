const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    value: String,
    mentions: [{
        date: Date,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        fault: { type: Schema.Types.ObjectId, ref: 'Fault' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Tag', tagSchema);

