import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startChatSession, getMapsGroundedResponse } from '../services/geminiService';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { InitialPrompts } from './InitialPrompts';
import { CareerMateIcon } from './Icons';
import { Sender, type Message, type UserLocation, type GroundingSource } from './types';
import type { Chat } from '@google/genai';


interface ChatInterfaceProps {
    userLocation: UserLocation | null;
    locationError: string | null;
}

const MAPS_KEYWORDS = ['nearby', 'directions to', 'where is', 'map of', 'find', 'restaurants', 'coffee shops', 'parks', 'gas stations', 'how do i get to'];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userLocation, locationError }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<Chat | null>(null);

    useEffect(() => {
        chatSession.current = startChatSession();
        setMessages([
            {
                id: 'initial-bot-message',
                sender: Sender.Bot,
                content: "Hello! I'm CareerMate. I can help you with interview prep, resume enhancement, or even find places nearby. How can I assist you today?"
            }
        ]);
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = { id: crypto.randomUUID(), sender: Sender.User, content: text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const lowercasedText = text.toLowerCase();
            const isMapQuery = MAPS_KEYWORDS.some(keyword => lowercasedText.includes(keyword));

            if (isMapQuery) {
                let botResponse: { content: string; sources?: GroundingSource[] };
                if (userLocation) {
                    const { text: groundedText, sources } = await getMapsGroundedResponse(text, userLocation);
                    botResponse = { content: groundedText, sources: sources };
                } else {
                    botResponse = { content: `I need your location for that query. ${locationError || 'Please enable location services and refresh.'}` };
                }
                const botMessage: Message = { id: crypto.randomUUID(), sender: Sender.Bot, ...botResponse };
                setMessages(prev => [...prev, botMessage]);
            } else {
                 if (!chatSession.current) {
                    chatSession.current = startChatSession();
                 }
                 const stream = await chatSession.current.sendMessageStream({ message: text });

                 const botMessageId = crypto.randomUUID();
                 setMessages(prev => [...prev, { id: botMessageId, sender: Sender.Bot, content: '' }]);

                 let fullResponse = "";
                 for await (const chunk of stream) {
                    fullResponse += chunk.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === botMessageId ? { ...msg, content: fullResponse } : msg
                    ));
                 }
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                sender: Sender.Bot,
                content: "Sorry, I'm having trouble connecting. Please try again in a moment."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [userLocation, locationError]);


    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            <header className="p-4 flex items-center space-x-4 bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CareerMateIcon />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-50">CareerMate AI</h1>
                    <p className="text-sm text-blue-400 font-medium">Your personal career & location assistant</p>
                </div>
            </header>
            
            <MessageList messages={messages} isLoading={isLoading} />
            
            {messages.length <= 1 && (
                <InitialPrompts onPromptClick={sendMessage} />
            )}
            
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
             {locationError && (
              <div className="text-center text-xs text-red-400 p-2 bg-gray-800/50">
                {locationError}
              </div>
            )}
        </div>
    );
};