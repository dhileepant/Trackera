const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    status: {
        type: String,
        enum: ['Applied', 'Round 1 Cleared', 'Round 2 Cleared', 'Round 3 Cleared', 'Selected', 'Rejected'],
        default: 'Applied'
    }
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
