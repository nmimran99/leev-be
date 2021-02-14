const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: String,
    description: String,
    siteId: Schema.Types.ObjectId,
    systemId: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    status: { type: Schema.Types.ObjectId, ref: 'Status'},
    createdBy: Schema.Types.ObjectId,
    following: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    isRepeatable: Boolean,
    schedule: {
        interval: String,
        year: Number,
        month: Number,
        day: Number,
        hour: Number,
        minutes: Number,
        alerts: []
    },
    images: [],
    comments: []
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

