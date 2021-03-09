const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const statusListSchema = new Schema({
    module: String,
    statusId: String,
    state: String,
    order: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('StatusList', statusListSchema);

