const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String, // HTML or Markdown
        required: true
    },
    constraints: [{
        type: String
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    starterCode: {
        // Map of language to starter code
        type: Map,
        of: String,
        default: {}
    },
    driverCode: {
        // Appended code to execute the function and print result as JSON
        type: Map,
        of: String,
        default: {}
    }
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
