
import React from 'react';
import { BriefcaseIcon, DocumentTextIcon, LocationMarkerIcon } from './Icons';

interface InitialPromptsProps {
    onPromptClick: (prompt: string) => void;
}

const prompts = [
    {
        icon: <BriefcaseIcon />,
        title: "Prep for an interview",
        text: "Help me prepare for an interview.",
    },
    {
        icon: <DocumentTextIcon />,
        title: "Enhance my resume",
        text: "Can you help enhance my resume?",
    },
    {
        icon: <LocationMarkerIcon />,
        title: "Find places nearby",
        text: "Show me coffee shops nearby.",
    }
];


export const InitialPrompts: React.FC<InitialPromptsProps> = ({ onPromptClick }) => {
    return (
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
                <button 
                    key={prompt.title}
                    onClick={() => onPromptClick(prompt.text)}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors duration-200 flex items-start space-x-4 border border-gray-700 hover:border-blue-500/50"
                >
                    <div className="text-blue-400 mt-1 flex-shrink-0">
                        {prompt.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-200">{prompt.title}</h3>
                        <p className="text-sm text-gray-400">'{prompt.text}'</p>
                    </div>
                </button>
            ))}
        </div>
    );
};