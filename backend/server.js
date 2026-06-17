const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const practiceRoutes = require('./routes/practiceRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('API is running...');
});

// Database connection
const DB = process.env.MONGODB_URI;
mongoose.connect(DB).then(() => {
    console.log('MongoDB connection successful');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
