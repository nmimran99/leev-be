const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: String,
    description: String,
    asset: Schema.Types.ObjectId,
    system: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    status: { type: Schema.Types.ObjectId, ref: 'StatusList'},
    createdBy: Schema.Types.ObjectId,
    relatedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    isRepeatable: Boolean,
    isUsingSteps: Boolean,
    isSequential: Boolean,
    steps: [{ 
        order: Number,
        title: String,
        description: String
    }], 
    schedule: {
        interval: String,
        year: Number,
        month: Number,
        day: Number,
        hour: Number,
        minutes: Number,
        alerts: [{ type: Schema.Types.ObjectId, ref: 'Alert'}],
    },
    images: [],
    comments: []
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

