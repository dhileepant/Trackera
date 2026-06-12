const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const mongoose = require('mongoose');
const axios = require('axios');

// Categories available
const CATEGORIES = [
    'Arrays', 'Sliding Window', 'Two Pointers', 'Binary Search',
    'Linked List', 'Stack', 'Queue', 'Trees / Graphs',
    'Dynamic Programming', 'Trie'
];

exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Count total problems per category matching what we have in DB
        const categoryCounts = await Problem.aggregate([
            { $group: { _id: "$category", total: { $sum: 1 } } }
        ]);

        // Count solved problems per category for this user
        const solvedCounts = await Progress.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'Solved' } },
            { $group: { _id: "$category", solved: { $sum: 1 } } }
        ]);

        const statsMap = {};
        CATEGORIES.forEach(c => statsMap[c] = { total: 0, solved: 0 });

        categoryCounts.forEach(c => {
            if (statsMap[c._id]) statsMap[c._id].total = c.total;
        });

        solvedCounts.forEach(c => {
            if (statsMap[c._id]) statsMap[c._id].solved = c.solved;
        });

        const formattedCategories = CATEGORIES.map(category => ({
            name: category,
            total: statsMap[category].total,
            solved: statsMap[category].solved
        }));

        res.status(200).json({ status: 'success', data: { categories: formattedCategories } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getProblemsByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;

        const problems = await Problem.find({ category }).select('title difficulty category');
        
        const progressLines = await Progress.find({ 
            userId, 
            problemId: { $in: problems.map(p => p._id) } 
        });

        const progressMap = {};
        progressLines.forEach(p => progressMap[p.problemId.toString()] = p.status);

        const problemsWithStatus = problems.map(p => ({
            _id: p._id,
            title: p.title,
            difficulty: p.difficulty,
            status: progressMap[p._id.toString()] || 'Not Started'
        }));

        res.status(200).json({ status: 'success', data: { problems: problemsWithStatus } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getProblemDetails = async (req, res) => {
    try {
        const { problemId } = req.params;
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        const testCases = await TestCase.find({ problemId, isHidden: false }).select('input output');

        res.status(200).json({
            status: 'success',
            data: { 
                problem,
                testCases
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

// ... Judge0 Execution Helper Placeholder ...
const languageMap = {
    'javascript': 63,
    'python3': 71,
    'java': 62,
    'cpp': 54
};

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCodeOnJudge0 = async (code, languageId, input) => {
    // If no API key, use local execution fallback (Very useful for development)
    if (!process.env.JUDGE0_API_KEY) {
        const os = require('os');
        return new Promise((resolve) => {
            try {
                const tempDir = path.join(os.tmpdir(), 'temp_exec');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                
                const fileName = 'exec_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                let fileExt = '';
                let command = '';
                
                if (languageId === 63) { // JS
                    fileExt = '.js';
                    command = `node ${fileName}${fileExt}`;
                } else if (languageId === 71) { // Python
                    fileExt = '.py';
                    command = `python ${fileName}${fileExt}`;
                } else {
                    return resolve({
                        stdout: null,
                        stderr: "Local execution only supports JS and Python. Please provide a RapidAPI Judge0 key for C++/Java.",
                        status: { id: 11, description: 'Runtime Error' },
                        time: 0
                    });
                }
                
                const filePath = path.join(tempDir, `${fileName}${fileExt}`);
                fs.writeFileSync(filePath, code);
                
                const startTime = Date.now();
                const child = exec(command, { cwd: tempDir, timeout: 5000 }, (error, stdout, stderr) => {
                    const endTime = Date.now();
                    const duration = (endTime - startTime) / 1000;
                    
                    // Cleanup
                    try { fs.unlinkSync(filePath); } catch(e) {}
                    
                    if (error && error.killed) {
                        return resolve({
                            stdout: null,
                            stderr: "Time Limit Exceeded",
                            status: { id: 5, description: 'Time Limit Exceeded' },
                            time: duration
                        });
                    }
                    
                    if (error) {
                        return resolve({
                            stdout: null,
                            stderr: `Local execution error (e.g. interpreter not found): ${error.message}. Please configure a RapidAPI JUDGE0_API_KEY environment variable in your Vercel deployment settings for production execution to work.`,
                            status: { id: 11, description: 'Runtime Error' },
                            time: duration
                        });
                    }
                    
                    resolve({
                        stdout: stdout || null,
                        stderr: stderr || null,
                        status: { id: 3, description: 'Accepted' },
                        time: duration
                    });
                });
                
                if (input) {
                    child.stdin.write(input);
                    child.stdin.end();
                }
            } catch (fsError) {
                resolve({
                    stdout: null,
                    stderr: `Local execution environment failed: ${fsError.message}. Please configure a RapidAPI JUDGE0_API_KEY environment variable in your Vercel deployment settings for production execution to work.`,
                    status: { id: 11, description: 'Execution Error' },
                    time: 0
                });
            }
        });
    }

    // Call RapidAPI Judge0
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            language_id: languageId,
            source_code: code,
            stdin: input || ""
        }
    };

    const submissionRes = await axios.request(options);
    const token = submissionRes.data.token;

    // Poll for result
    let statusId = 1;
    let result = null;
    while (statusId <= 2) {
        await new Promise(r => setTimeout(r, 1000));
        const res = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?fields=*`, {
            headers: {
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        });
        statusId = res.data.status.id;
        result = res.data;
    }
    return result;
};


exports.runCode = async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        const languageId = languageMap[language];

        if (!languageId) return res.status(400).json({ message: 'Unsupported language' });

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        let finalCode = code;
        if (problem.driverCode && problem.driverCode.get(language)) {
            finalCode = code + '\n' + problem.driverCode.get(language);
        }

        const visibleTestCases = await TestCase.find({ problemId, isHidden: false });
        if (visibleTestCases.length === 0) return res.status(400).json({ message: 'No visible test cases found' });

        let allPassed = true;
        let results = [];

        for (let i = 0; i < visibleTestCases.length; i++) {
            const tc = visibleTestCases[i];
            const result = await executeCodeOnJudge0(finalCode, languageId, tc.input);
            const stdOut = result.stdout ? result.stdout.trim() : (result.stderr || result.compile_output || '').trim();
            
            let passed = false;
            if (result.status && result.status.id === 3) {
                try {
                    const parsedOut = JSON.parse(stdOut);
                    const parsedExp = JSON.parse(tc.output.trim());
                    passed = (JSON.stringify(parsedOut) === JSON.stringify(parsedExp));
                } catch(e) {
                    passed = (stdOut === tc.output.trim());
                }
            }

            if (!passed) allPassed = false;

            results.push({
                testCaseIndex: i + 1,
                passed,
                input: tc.input,
                expected: tc.output.trim(),
                output: stdOut || result.status?.description,
                runtime: parseFloat(result.time || 0) * 1000
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                allPassed,
                results
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.submitCode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code, language, problemId } = req.body;
        
        const languageId = languageMap[language];
        if (!languageId) return res.status(400).json({ message: 'Unsupported language' });

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        let finalCode = code;
        if (problem.driverCode && problem.driverCode.get(language)) {
            finalCode = code + '\n' + problem.driverCode.get(language);
        }

        const testCases = await TestCase.find({ problemId });
        if (testCases.length === 0) return res.status(400).json({ message: 'No test cases found for problem' });

        let allPassed = true;
        let finalStatus = 'Accepted';
        let maxRuntime = 0;
        let results = [];

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const result = await executeCodeOnJudge0(finalCode, languageId, tc.input);
            
            const stdOut = result.stdout ? result.stdout.trim() : (result.stderr || result.compile_output || '').trim();
            let passed = false;

            if (result.status && result.status.id === 3) {
                try {
                    const parsedOut = JSON.parse(stdOut);
                    const parsedExp = JSON.parse(tc.output.trim());
                    passed = (JSON.stringify(parsedOut) === JSON.stringify(parsedExp));
                } catch(e) {
                    passed = (stdOut === tc.output.trim());
                }
            } else {
                finalStatus = result.status?.description || 'Runtime Error';
            }

            if (!passed) {
                allPassed = false;
                if (finalStatus === 'Accepted') finalStatus = 'Wrong Answer';
            }
            
            let runtime = parseFloat(result.time || 0) * 1000;
            maxRuntime = Math.max(maxRuntime, runtime);

            // Hide hidden inputs from user response
            results.push({
                testCaseIndex: i + 1,
                passed,
                input: tc.isHidden ? 'Hidden Test Case' : tc.input,
                expected: tc.isHidden ? 'Hidden' : tc.output.trim(),
                output: tc.isHidden ? 'Hidden' : stdOut || finalStatus,
                runtime
            });

            // Fast fail (standard for platforms like LeetCode)
            if (!passed) break;
        }

        // Record submission
        await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: finalStatus,
            runtime: maxRuntime
        });

        // Update progress if completely accepted
        if (allPassed) {
            await Progress.findOneAndUpdate(
                { userId, problemId },
                { 
                   category: problem.category,
                   status: 'Solved' 
                },
                { upsert: true, new: true }
            );
        } else {
             // Only log 'Attempted' if not already Solved previously
             const prog = await Progress.findOne({ userId, problemId });
             if (!prog || prog.status !== 'Solved') {
                 await Progress.findOneAndUpdate(
                    { userId, problemId },
                    { 
                       category: problem.category,
                       status: 'Attempted' 
                    },
                    { upsert: true, new: true }
                );
             }
        }

        res.status(200).json({
            status: 'success',
            data: {
                passed: allPassed,
                status: finalStatus,
                runtime: maxRuntime,
                results
            }
        });

    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
