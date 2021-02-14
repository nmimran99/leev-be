const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faultSchema = new Schema({
    title: String,
    description: String,
    location: String,
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    system: { type: Schema.Types.ObjectId, ref: 'System'},
    following: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    status: String,
    images: [],
    comments: [],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
    timestamps: true
});

module.exports = mongoose.model('Fault', faultSchema);

