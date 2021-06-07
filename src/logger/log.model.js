const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const logSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    actionBy: { type: Schema.Types.ObjectId, ref: 'User'},
    actionType: String,
    operationType: String,
    itemData: {
        module: String,
        itemId: String,
        itemIdentifier: Schema.Types.ObjectId
    },
    payload: Object
}, {
    timestamps: true
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;


