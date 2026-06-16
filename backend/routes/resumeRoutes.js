const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure temp_uploads directory exists inside the backend workspace
const uploadDir = path.join(__dirname, '../temp_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept ONLY PDFs
const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' && fileExtension === '.pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files (.pdf) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

// Helper wrapper to handle multer errors gracefully
const handleUpload = (req, res, next) => {
    const uploadSingle = upload.single('resume');
    
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ status: 'fail', message: 'File is too large. Maximum size is 5 MB.' });
            }
            return res.status(400).json({ status: 'fail', message: err.message });
        } else if (err) {
            return res.status(400).json({ status: 'fail', message: err.message });
        }
        next();
    });
};

// All routes are protected by JWT authentication
router.use(protect);

router.post('/analyze', handleUpload, resumeController.analyzeResume);
router.get('/history', resumeController.getHistory);
router.get('/:id', resumeController.getAnalysisById);
router.delete('/:id', resumeController.deleteAnalysis);

module.exports = router;
