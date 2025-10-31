
import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="p-4 bg-gray-900/70 backdrop-blur-sm border-t border-gray-700/50">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask CareerMate..."
                    disabled={isLoading}
                    className="flex-1 p-3 bg-gray-800 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400 disabled:opacity-50 transition-shadow"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white hover:opacity-90 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};