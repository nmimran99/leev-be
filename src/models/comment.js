const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    parentObject: Schema.Types.ObjectId, 
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    text: String,
    image: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);

