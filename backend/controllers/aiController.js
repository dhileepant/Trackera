const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy-key",
});

exports.chat = async (req, res) => {
    try {
        const { message, context = [] } = req.body;

        if (!message) {
            return res.status(400).json({ status: 'fail', message: 'Message is required' });
        }

        // Mock response if no valid API key is present
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key') {
            console.warn("MOCK EXECUTION: GROQ_API_KEY is missing. Returning static bot answer.");
            
            // Artificial delay to simulate thinking
            await new Promise(resolve => setTimeout(resolve, 800));

            return res.status(200).json({
                status: 'success',
                reply: `(MOCK AI via llama-3.3-70b-versatile): As an expert DSA mentor, I heard: "${message}". Please add your GROQ_API_KEY to the .env file if you wish to talk to the real API.`,
            });
        }

        const systemPrompt = {
            role: 'system',
            content: "You are an expert DSA mentor and coding assistant. Help students understand concepts, debug code, and guide them step-by-step. Do not give full solutions unless explicitly asked."
        };

        const formattedContext = context.map(c => ({
            role: c.role === 'assistant' ? 'assistant' : 'user',
            content: c.content
        }));

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [systemPrompt, ...formattedContext, { role: "user", content: message }],
            temperature: 0.7,
            max_tokens: 1024,
        });

        res.status(200).json({
            status: 'success',
            reply: response.choices[0].message.content
        });

    } catch (err) {
        console.error("Groq AI Error:", err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong, try again'
        });
    }
};
