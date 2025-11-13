const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // format: YYYY-MM-DD
        required: true
    },
    problemsSolved: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure unique entry for a user per day
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);

module.exports = DailyActivity;
