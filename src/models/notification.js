const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    actionType: String,
    actionOn: {
        obejctType: String,
        internalId: Schema.Types.ObjectId,
        externalId: String
    },
    actionBy: { type: Schema.Types.ObjectId, ref: 'User' },
    read: Boolean,
    data: {}
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);

