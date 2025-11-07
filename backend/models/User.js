const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    college: {
        type: String,
        required: [true, 'Please provide your college name']
    },
    city: {
        type: String,
        required: [true, 'Please provide your city']
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    leetcodeUsername: {
        type: String,
        default: ''
    },
    codeforcesHandle: {
        type: String,
        default: ''
    },
    githubUsername: {
        type: String,
        default: ''
    },
    codechefUsername: {
        type: String,
        default: ''
    },
    geeksforgeeksUsername: {
        type: String,
        default: ''
    },
    leetcodeStats: {
        totalSolved: { type: Number, default: 0 },
        easySolved: { type: Number, default: 0 },
        mediumSolved: { type: Number, default: 0 },
        hardSolved: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        streak: { type: Number, default: 0 }
    },
    githubStats: {
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        contributions: { type: Number, default: 0 },
        language: { type: String, default: '' }
    },
    codeforcesStats: {
        rating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 0 },
        rank: { type: String, default: 'unrated' },
        maxRank: { type: String, default: 'unrated' },
        contests: { type: Number, default: 0 },
        contribution: { type: Number, default: 0 }
    },
    codechefStats: {
        rating: { type: Number, default: 0 },
        stars: { type: String, default: '1★' },
        globalRank: { type: Number, default: 0 }
    },
    gfgStats: {
        problemsSolved: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        institutionRank: { type: Number, default: 0 }
    },
    lastSynced: {
        type: Date
    },
    cgpa: {
        type: Number,
        default: 0
    },
    year: {
        type: Number,
        default: 1
    },
    placementStatus: {
        type: String,
        enum: ['Placed', 'Not Placed'],
        default: 'Not Placed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
