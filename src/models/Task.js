const mongoose = require('mongoose');
const { incrementCounter } = require('../services/counter.service');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    startDate: Date,
    interval: String,
    intervalNumber: Number
}, {
    timestamps: true
});

const taskSchema = new Schema({
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant'},
    taskId: String,
    title: String,
    description: String,
    asset: { type: Schema.Types.ObjectId, default: null, ref: 'Asset'},
    system: { type: Schema.Types.ObjectId, default: null, ref: 'System'},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    status: { type: Schema.Types.ObjectId, ref: 'StatusList'},
    createdBy: Schema.Types.ObjectId,
    relatedUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    isRepeatable: Boolean,
    isUsingSteps: Boolean,
    isSequential: Boolean,
    steps: [{ 
        order: Number,
        description: String
    }], 
    schedule: [alertSchema],
    images: [],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {
    timestamps: true
});

taskSchema.pre('save', async function(next) {
    let task = this;
    let newValue = await incrementCounter('tasks');
    task.taskId = 'TSK-' + newValue.currentValue;
    next();
})

module.exports = mongoose.model('Task', taskSchema);

