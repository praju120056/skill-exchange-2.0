import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, Check, Sparkles, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askAIMentor } from '../../services/aiService';
import { toast } from 'react-hot-toast';

interface AIMentorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSkill?: string;
}

const SUGGESTED_QUESTIONS = [
    'What should I learn next?',
    'What projects should I build?',
    'How long to become proficient?',
    'Best resources to get started?'
];

const AIMentorModal: React.FC<AIMentorModalProps> = ({ isOpen, onClose, initialSkill = '' }) => {
    const [skill, setSkill] = useState(initialSkill);
    const [isEditingSkill, setIsEditingSkill] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [loadingPhrase, setLoadingPhrase] = useState('Thinking...');
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const skillInputRef = useRef<HTMLInputElement>(null);

    const loadingPhrases = ['Thinking...', 'Generating...', 'Crafting response...'];

    useEffect(() => {
        if (initialSkill) {
            setSkill(initialSkill);
            setIsEditingSkill(false);
        }
    }, [initialSkill, isOpen]);

    useEffect(() => {
        if (!isLoading) return;
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % loadingPhrases.length;
            setLoadingPhrase(loadingPhrases[i]);
        }, 1200);
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        if (isEditingSkill && skillInputRef.current) {
            skillInputRef.current.focus();
        }
    }, [isEditingSkill]);

    const handleAsk = async () => {
        if (!skill.trim() || !question.trim()) {
            toast.error('Please specify both skill and question');
            return;
        }
        setIsLoading(true);
        setAnswer('');
        setIsCollapsed(false);

        try {
            const result = await askAIMentor(skill.trim(), question.trim());
            setAnswer(result);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'AI Mentor is unavailable');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(answer);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setAnswer('');
        setQuestion('');
        setIsCollapsed(false);
        setIsEditingSkill(false);
        onClose();
    };

    const handleSuggestedClick = (q: string) => {
        setQuestion(q);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-5"
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 355 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-gray-100">AI Mentor</h2>
                                            
                                            {/* Sleek inline skill badge */}
                                            {isEditingSkill ? (
                                                <input
                                                    ref={skillInputRef}
                                                    type="text"
                                                    value={skill}
                                                    onChange={(e) => setSkill(e.target.value)}
                                                    onBlur={() => setIsEditingSkill(false)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingSkill(false)}
                                                    className="px-2 py-0.5 bg-white/10 border border-amber-500/50 rounded text-xs text-amber-300 w-24 focus:outline-none"
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditingSkill(true)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-600/35 transition-colors"
                                                    title="Click to edit skill context"
                                                >
                                                    <span>{skill || 'Select Skill'}</span>
                                                    <Edit2 className="w-2.5 h-2.5 opacity-60" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500">Ask learning roadmap questions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                    aria-label="Close AI Mentor"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ChatGPT-style unified input area */}
                            <div className="relative flex flex-col gap-2 bg-white/5 border border-white/10 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 rounded-xl p-2.5 transition-all">
                                <textarea
                                    ref={textareaRef}
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder={`Ask anything about learning ${skill || 'this skill'}...`}
                                    aria-label="AI question input"
                                    rows={2}
                                    className="w-full bg-transparent text-gray-100 placeholder-gray-600 text-xs focus:outline-none resize-none custom-scrollbar leading-relaxed"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAsk();
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5 flex-shrink-0">
                                    <span className="text-[9px] text-gray-600">Press Enter to Ask</span>
                                    <motion.button
                                        onClick={handleAsk}
                                        disabled={isLoading || !skill.trim() || !question.trim()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 text-white font-medium text-xs disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-3 h-3" />
                                        )}
                                        <span>{isLoading ? loadingPhrase : 'Ask'}</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Suggested questions (compact layout) */}
                            <div className="mt-3 mb-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSuggestedClick(q)}
                                            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                                                question === q
                                                    ? 'bg-amber-600/25 border-amber-500/40 text-amber-300'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                                            }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Loading skeleton */}
                            {isLoading && (
                                <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="skeleton h-3 w-full rounded" />
                                    <div className="skeleton h-3 w-11/12 rounded" />
                                    <div className="skeleton h-3 w-4/5 rounded" />
                                </div>
                            )}

                            {/* AI Response */}
                            <AnimatePresence>
                                {answer && !isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="bg-white/5 border border-amber-500/20 rounded-xl overflow-hidden mt-3"
                                    >
                                        {/* Response header */}
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                <span className="text-xs font-semibold text-amber-300">Mentor Guide</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <motion.button
                                                    onClick={handleCopy}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    aria-label="Copy response"
                                                >
                                                    {copied ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </motion.button>
                                                <button
                                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                                                    aria-label={isCollapsed ? 'Expand response' : 'Collapse response'}
                                                >
                                                    {isCollapsed ? (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Response body */}
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3.5 max-h-[350px] overflow-y-auto custom-scrollbar prose prose-invert prose-xs max-w-none text-gray-200 leading-relaxed text-xs">
                                                        <ReactMarkdown
                                                            components={{
                                                                code: ({ children, className }) => {
                                                                    const isBlock = className?.includes('language-');
                                                                    return isBlock ? (
                                                                        <code className="block bg-black/40 rounded-lg p-2.5 text-[10px] text-green-300 overflow-x-auto my-1.5 border border-white/10">
                                                                            {children}
                                                                        </code>
                                                                    ) : (
                                                                        <code className="bg-black/30 rounded px-1 py-0.5 text-amber-300 text-[10px]">
                                                                            {children}
                                                                        </code>
                                                                    );
                                                                },
                                                                p: ({ children }) => (
                                                                    <p className="mb-2 text-gray-200">{children}</p>
                                                                ),
                                                                ul: ({ children }) => (
                                                                    <ul className="list-disc list-inside space-y-0.5 mb-2 text-gray-300">{children}</ul>
                                                                ),
                                                                ol: ({ children }) => (
                                                                    <ol className="list-decimal list-inside space-y-0.5 mb-2 text-gray-300">{children}</ol>
                                                                ),
                                                                strong: ({ children }) => (
                                                                    <strong className="text-white font-semibold">{children}</strong>
                                                                ),
                                                            }}
                                                        >
                                                            {answer}
                                                        </ReactMarkdown>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIMentorModal;
