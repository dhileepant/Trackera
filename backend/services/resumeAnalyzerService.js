const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Normalizes the parsed data to match the expected schema
 */
const normalizeData = (data) => {
    return {
        atsScore: typeof data.atsScore === 'number' ? data.atsScore : 70,
        summary: typeof data.summary === 'string' ? data.summary : 'Resume analyzed successfully.',
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        placementReadiness: typeof data.placementReadiness === 'string' ? data.placementReadiness : 'Average'
    };
};

/**
 * Intelligent rule-based fallback analyzer for local testing when API key is missing
 */
const getMockAnalysis = (text) => {
    const textLower = text.toLowerCase();
    
    // Simple rule-based keyword extraction for mock analysis
    const hasReact = textLower.includes('react');
    const hasNode = textLower.includes('node') || textLower.includes('express');
    const hasPython = textLower.includes('python');
    const hasJava = textLower.includes('java');
    const hasCpp = textLower.includes('c++') || textLower.includes('cpp');
    const hasDocker = textLower.includes('docker');
    const hasAws = textLower.includes('aws') || textLower.includes('cloud') || textLower.includes('azure') || textLower.includes('gcp');
    const hasTypescript = textLower.includes('typescript');
    const hasSql = textLower.includes('sql') || textLower.includes('mysql') || textLower.includes('postgres');
    
    const skillsFound = [];
    if (hasReact) skillsFound.push('React');
    if (hasNode) skillsFound.push('Node.js');
    if (hasPython) skillsFound.push('Python');
    if (hasJava) skillsFound.push('Java');
    if (hasCpp) skillsFound.push('C++');
    if (hasSql) skillsFound.push('SQL');
    
    const missing = [];
    if (!hasDocker) missing.push('Docker');
    if (!hasAws) missing.push('AWS / Cloud Platforms');
    if (!hasTypescript) missing.push('TypeScript');
    if (!textLower.includes('ci/cd') && !textLower.includes('jenkins') && !textLower.includes('github actions')) {
        missing.push('CI/CD Pipelines');
    }
    if (!textLower.includes('jest') && !textLower.includes('testing') && !textLower.includes('mocha')) {
        missing.push('Unit Testing (Jest/Mocha)');
    }
    
    const strengths = [];
    if (skillsFound.length > 0) {
        strengths.push(`Good command of technical languages/frameworks: ${skillsFound.join(', ')}`);
    } else {
        strengths.push("Has foundational programming language skills mentioned");
    }
    strengths.push("Clear listing of personal projects and education details");
    strengths.push("Proper layout showing academic achievements and CGPA");
    
    const weaknesses = [];
    if (missing.length > 0) {
        weaknesses.push(`Lacks exposure to modern enterprise tools like: ${missing.slice(0, 3).join(', ')}`);
    }
    weaknesses.push("Missing performance indicators or quantitative results for personal projects");
    weaknesses.push("No explicit test coverage details mentioned for applications");
    
    const improvements = [
        "Quantify project impact using metrics (e.g., 'reduced API latency by 30%', 'scaled to 500+ active users')",
        "Add unit test configurations to showcase code quality practices",
        "Integrate cloud deployment or containerization (Docker) to show end-to-end delivery skills"
    ];
    
    // Calculate a mock score based on features
    let score = 65;
    if (skillsFound.length > 2) score += 10;
    if (hasDocker) score += 5;
    if (hasAws) score += 5;
    if (textLower.includes('intern') || textLower.includes('experience') || textLower.includes('internship')) score += 10;
    if (score > 98) score = 98;
    
    let readiness = "Average";
    if (score >= 85) readiness = "Excellent - Ready for Interviews";
    else if (score >= 70) readiness = "Good - Ready with minor project tweaks";
    else if (score >= 60) readiness = "Average - Focus on building backend/cloud projects";
    
    return {
        atsScore: score,
        summary: `The resume demonstrates a ${score >= 75 ? 'strong' : 'fair'} software engineering foundation with exposure to ${skillsFound.length > 0 ? skillsFound.join(', ') : 'core programming languages'}. It lists relevant projects but requires additional modern development practices (DevOps, testing, cloud) to boost ATS ranking.`,
        strengths,
        weaknesses,
        missingSkills: missing,
        improvements,
        placementReadiness: readiness
    };
};

/**
 * Analyzes resume text using Gemini AI
 */
const analyzeResume = async (resumeText) => {
    // Check if API key is missing or dummy
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
        console.warn("MOCK EXECUTION: GEMINI_API_KEY is missing. Returning mock resume analysis.");
        // Artificial delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 1500));
        return getMockAnalysis(resumeText);
    }
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash for speed and reliability
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `Analyze this resume for software engineering placements.
Evaluate:
- ATS compatibility (assign a realistic ATS Score between 0 and 100)
- Technical skills
- Projects
- Resume quality
- Missing industry skills
- Placement readiness

Return ONLY valid JSON structure matching this schema:
{
  "atsScore": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "improvements": [],
  "placementReadiness": ""
}

Resume Text:
${resumeText}`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        try {
            const parsedData = JSON.parse(textResponse.trim());
            return normalizeData(parsedData);
        } catch (parseErr) {
            console.error("Failed to parse Gemini output as JSON. Trying extraction regex.", parseErr);
            // Try to extract JSON if it was wrapped in markdown ```json ... ``` or other text
            const jsonRegex = /\{[\s\S]*\}/;
            const match = textResponse.match(jsonRegex);
            if (match) {
                try {
                    const parsedData = JSON.parse(match[0]);
                    return normalizeData(parsedData);
                } catch (nestedErr) {
                    console.error("Regex match JSON parse failed", nestedErr);
                }
            }
            throw new Error("Invalid JSON returned by Gemini");
        }
    } catch (err) {
        console.error("Gemini service failed. Using mock fallback.", err);
        return getMockAnalysis(resumeText);
    }
};

module.exports = {
    analyzeResume
};
