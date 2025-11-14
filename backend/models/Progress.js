const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Attempted', 'Solved'],
        required: true
    }
}, { timestamps: true });

// Ensure unique progress per user per problem
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
