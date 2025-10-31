import React, { useEffect, useRef } from 'react';
import { Sender, type Message, type GroundingSource } from './types';
import { UserIcon, CareerMateIcon, MapPinIcon } from './Icons';
import './MessageList.css';

// A more robust markdown parser for bold, italics and lists
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const formatInline = (str: string) => {
        // Process bold first, then italics to avoid conflicts.
        return str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italics
    };

    // The component will render a sequence of elements (paragraphs or lists)
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;

    // Split content into blocks based on double newlines
    const blocks = text.split('\n\n');

    blocks.forEach(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        const lines = trimmedBlock.split('\n');
        
        let currentParagraphLines: string[] = [];
        let currentListItems: string[] = [];

        const flushParagraph = () => {
            if (currentParagraphLines.length > 0) {
                const content = currentParagraphLines.map(line => formatInline(line)).join('<br />');
                elements.push(
                    <p 
                        key={`p-${keyIndex++}`} 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                );
                currentParagraphLines = [];
            }
        };

        const flushList = () => {
            if (currentListItems.length > 0) {
               elements.push(
                   <ul key={`ul-${keyIndex++}`} className="list-disc pl-5 space-y-1 my-2">
                       {currentListItems.map((item, j) => (
                           <li 
                               key={j} 
                               dangerouslySetInnerHTML={{ __html: formatInline(item) }} 
                           />
                       ))}
                   </ul>
               );
               currentListItems = [];
            }
        };

        lines.forEach(line => {
            if (line.trim().startsWith('* ')) {
                flushParagraph(); // end current paragraph
                currentListItems.push(line.trim().substring(2));
            } else {
                flushList(); // end current list
                // Only push non-empty lines to paragraph
                if (line.trim() !== '') {
                    currentParagraphLines.push(line);
                }
            }
        });

        // Flush any remaining content at the end of the block
        flushParagraph();
        flushList();
    });

    return <>{elements}</>;
};

// Define the props interface for MessageBubble
interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === Sender.User;

    const bubbleClasses = isUser
        ? 'bg-gradient-to-br from-blue-600 to-blue-500 rounded-br-none'
        : 'bg-gray-700 rounded-bl-none';
    
    const containerClasses = isUser ? 'justify-end' : 'justify-start';
    const icon = isUser ? <UserIcon /> : <CareerMateIcon />;

    return (
        <div className={`flex items-end gap-3 ${containerClasses}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
            )}
            <div className={`max-w-md lg:max-w-xl px-4 py-3 rounded-xl shadow-lg ${bubbleClasses}`}>
                 <div className="prose prose-invert prose-sm text-white">
                    <SimpleMarkdown text={message.content} />
                 </div>
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600/70">
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">Sources from Google Maps:</h4>
                        <div className="flex flex-col space-y-2">
                            {message.sources.map((source: GroundingSource, index: number) => (
                                <a
                                    key={index}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-1.5"
                                >
                                    <MapPinIcon />
                                    <span>{source.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
            )}
        </div>
    );
};

// Define the props interface for MessageList
interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                {messages.map((message: Message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                           <CareerMateIcon />
                        </div>
                        <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-lg bg-gray-700 rounded-bl-none flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse delay-0"></span>
                            <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                            <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
        </div>
    );
};