const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    title: String,
    description: String,
    siteId: Schema.Types.ObjectId,
    systemId: Schema.Types.ObjectId,
    linkedUsers: [],
    files: [],
    createdBy: Schema.Types.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);

