import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    onTyping?: (isTyping: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, onTyping }) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);

        // Auto-resize
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
        }

        // Typing indicator
        if (onTyping) {
            onTyping(true);
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => onTyping(false), 1500);
        }
    };

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        if (onTyping) onTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            className={`flex items-end gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                isFocused
                    ? 'bg-white/10 border-indigo-500/70 shadow-glow'
                    : 'bg-white/5 border-white/10'
            }`}
            animate={{ scale: isFocused ? 1.01 : 1 }}
            transition={{ duration: 0.15 }}
        >
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={disabled ? 'Select a conversation to chat' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
                disabled={disabled}
                rows={1}
                aria-label="Message input"
                className="flex-1 resize-none bg-transparent text-gray-100 placeholder-gray-600 text-sm focus:outline-none leading-relaxed max-h-32 overflow-y-auto custom-scrollbar disabled:cursor-not-allowed"
                style={{ minHeight: '24px' }}
            />

            <motion.button
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
                aria-label="Send message"
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
                whileHover={{ scale: disabled || !text.trim() ? 1 : 1.05 }}
                whileTap={{ scale: disabled || !text.trim() ? 1 : 0.95 }}
            >
                <Send className="w-4 h-4" />
            </motion.button>
        </motion.div>
    );
};

export default ChatInput;
