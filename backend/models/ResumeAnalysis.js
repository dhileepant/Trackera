const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    atsScore: {
        type: Number,
        required: [true, 'ATS score is required'],
        min: 0,
        max: 100
    },
    summary: {
        type: String,
        required: [true, 'Summary is required']
    },
    strengths: {
        type: [String],
        default: []
    },
    weaknesses: {
        type: [String],
        default: []
    },
    missingSkills: {
        type: [String],
        default: []
    },
    improvements: {
        type: [String],
        default: []
    },
    placementReadiness: {
        type: String,
        required: [true, 'Placement readiness assessment is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

module.exports = ResumeAnalysis;
