import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MessageSquare, Loader2, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/aiService';

const AIAssistant = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI coding mentor. Ask me anything about Data Structures, Algorithms, or general coding concepts." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Pass full conversation history for context, could be optimized later
            const res = await sendChatMessage(input, messages.slice(-10));
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="h-16 bg-[#111827] border-b border-white/5 flex items-center px-6 shrink-0 shadow-sm z-10">
                <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="mx-auto flex items-center gap-2 border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 rounded-full">
                    <MessageSquare size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-blue-400">Trackera AI Assistant</span>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-[#1e293b] text-[#3B82F6] border border-white/10'
                            }`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed ${
                                msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                                : 'bg-[#111827] text-slate-200 border border-white/5 rounded-tl-sm shadow-sm'
                            }`}>
                                {/* Simple text render, ideally ReactMarkdown could be used here */}
                                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#1e293b] text-[#3B82F6] border border-white/10 flex items-center justify-center shadow-lg">
                                <Bot size={22} />
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-[#111827] border border-white/5 rounded-tl-sm flex items-center gap-2 shadow-sm">
                                <Loader2 size={18} className="text-blue-500 animate-spin" />
                                <span className="text-sm text-slate-400 font-medium">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-[#0B0F14] border-t border-white/5 shrink-0">
                <div className="max-w-3xl mx-auto relative">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Trackera AI..."
                            className="w-full bg-[#111827] text-white border border-white/10 rounded-2xl pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                            disabled={loading}
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:active:scale-100 disabled:shadow-none"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="text-center mt-3 text-xs text-slate-500 font-medium">
                        Trackera AI can make mistakes. Consider verifying coding suggestions.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AIAssistant;
