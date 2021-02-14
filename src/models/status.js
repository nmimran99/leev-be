const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
    statusId: String,
    state: String,
    order: Number
}, {
    timestamps: true
})

const statusListSchema = new Schema({
    module: String,
    statusList: [statusSchema]
    
}, {
    timestamps: true
});

module.exports = mongoose.model('StatusList', statusListSchema);

