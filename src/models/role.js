const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Permission system works as follows:
// Each role has a permissions field that hosts an array of permissions by module. 
// values in CRUD operation: 
// 0 - No access
// 1 - Only what's realted to me (Owner\Following\Related)
// 2 - Everything related to me or others



const roleSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    roleName: String,
    permissions: [Object],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);

