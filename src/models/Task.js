const mongoose = require('mongoose');
const { incrementCounter } = require('../services/counter.service');
const { createNotification } = require('../services/notification.service');
const Schema = mongoose.Schema;

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
    isUsingSteps: Boolean,
    steps: [{ 
        order: Number,
        description: String,
        isCompleted: Boolean
    }],
    isRepeatable: Boolean,
    schedule: [],
    isRepeatActive: Boolean,
    instances: [{ type: Schema.Types.ObjectId, ref: 'Task'}],
    images: [],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}],
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' } 
}, {
    timestamps: true
});

taskSchema.pre('save', async function(next) {
    let task = this;
    let newValue = await incrementCounter('tasks');
    task.taskId = (task.isRepeatable ? 'RTSK-' : 'TSK-') + newValue.currentValue;
    next();
})

const Task = mongoose.model('Task', taskSchema);
Task.watch([], { fullDocument: 'updateLookup' })
.on('change', (data) => {
    createNotification(data);
})
module.exports = Task;


