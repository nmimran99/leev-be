const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    module: String,
    currentValue: Number,
}, {
    timestamps: true
});

module.exports = mongoose.model('Counter', counterSchema);

