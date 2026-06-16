const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const resumeAnalyzerService = require('../services/resumeAnalyzerService');

/**
 * Uploads a resume PDF, extracts text, calls Gemini AI to analyze, and stores analysis in DB.
 */
exports.analyzeResume = async (req, res) => {
    let tempFilePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'Please upload a resume PDF file.' });
        }
        
        tempFilePath = req.file.path;
        
        // Extra validation for PDF file format
        if (req.file.mimetype !== 'application/pdf') {
            fs.unlinkSync(tempFilePath);
            return res.status(400).json({ status: 'fail', message: 'Only PDF files are allowed.' });
        }
        
        // Read PDF and extract text using the PDFParse class
        const dataBuffer = fs.readFileSync(tempFilePath);
        const pdfParserInstance = new PDFParse({ data: dataBuffer });
        await pdfParserInstance.load();
        const parsedPdf = await pdfParserInstance.getText();
        
        if (!parsedPdf || !parsedPdf.text || !parsedPdf.text.trim()) {
            fs.unlinkSync(tempFilePath);
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Failed to extract text from the PDF. The file may be scanned, image-only, password-protected, or corrupted.' 
            });
        }
        
        // Call Gemini service to analyze text
        const analysisResult = await resumeAnalyzerService.analyzeResume(parsedPdf.text);
        
        // Create document in database
        const resumeAnalysis = await ResumeAnalysis.create({
            user: req.user._id,
            fileName: req.file.originalname,
            atsScore: analysisResult.atsScore,
            summary: analysisResult.summary,
            strengths: analysisResult.strengths,
            weaknesses: analysisResult.weaknesses,
            missingSkills: analysisResult.missingSkills,
            improvements: analysisResult.improvements,
            placementReadiness: analysisResult.placementReadiness
        });
        
        // Clean up temporary file
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (unlinkErr) {
            console.error("Failed to delete temp file:", unlinkErr);
        }
        
        res.status(201).json({
            status: 'success',
            data: {
                analysis: resumeAnalysis
            }
        });
    } catch (err) {
        console.error("Resume analysis controller error:", err);
        
        // Ensure file cleanup in case of error
        try {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (unlinkErr) {
            console.error("Failed to delete temp file in catch block:", unlinkErr);
        }
        
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while analyzing the resume: ' + err.message
        });
    }
};

/**
 * Retrieves the analysis history for the current logged-in student.
 */
exports.getHistory = async (req, res) => {
    try {
        const history = await ResumeAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: history.length,
            data: {
                history
            }
        });
    } catch (err) {
        console.error("Get history error:", err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve analysis history'
        });
    }
};

/**
 * Retrieves a specific analysis report by ID after verifying ownership.
 */
exports.getAnalysisById = async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findById(req.params.id);
        
        if (!analysis) {
            return res.status(404).json({ status: 'fail', message: 'Analysis report not found' });
        }
        
        // Verify ownership
        if (analysis.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You do not have permission to view this report' });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                analysis
            }
        });
    } catch (err) {
        console.error("Get analysis by ID error:", err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve analysis report'
        });
    }
};

/**
 * Deletes a specific analysis report by ID after verifying ownership.
 */
exports.deleteAnalysis = async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findById(req.params.id);
        
        if (!analysis) {
            return res.status(404).json({ status: 'fail', message: 'Analysis report not found' });
        }
        
        // Verify ownership
        if (analysis.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete this report' });
        }
        
        await ResumeAnalysis.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Analysis report deleted successfully',
            data: null
        });
    } catch (err) {
        console.error("Delete analysis error:", err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete analysis report'
        });
    }
};
