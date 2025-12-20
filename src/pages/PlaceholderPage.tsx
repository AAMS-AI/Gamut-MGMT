import React from 'react';

interface PlaceholderPageProps {
    title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-black mb-4 gradient-text">{title}</h1>
            <p className="text-text-muted text-lg max-w-md">
                This feature is currently being implemented. Check back soon for updates.
            </p>
            <div className="mt-8 p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                <code className="text-accent-electric">Construction in Progress</code>
            </div>
        </div>
    );
};
