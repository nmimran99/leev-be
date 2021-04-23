const mongoose = require('mongoose');
const { incrementCounter } = require('../services/counter.service');
const { createNotification } = require('../services/notification.service');
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
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}],
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' } 
}, {
    timestamps: true
});

taskSchema.pre('save', async function(next) {
    let task = this;
    let newValue = await incrementCounter('tasks');
    task.taskId = 'TSK-' + newValue.currentValue;
    next();
})

const Task = mongoose.model('Task', taskSchema);
Task.watch([], { fullDocument: 'updateLookup' })
.on('change', (data) => {
    createNotification(data);
})
module.exports = Task;


