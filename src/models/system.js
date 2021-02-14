const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const systemSchema = new Schema({
    name: String,
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    linkedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}]
}, {
    timestamps: true
});

module.exports = mongoose.model('System', systemSchema);