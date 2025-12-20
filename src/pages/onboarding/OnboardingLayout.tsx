import React from 'react';

export const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Left Panel - Visual/Brand */}
            <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-black via-transparent to-transparent opacity-80" />

                <div className="relative z-10 p-12 text-center">
                    <h1 className="text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-linear-to-r from-white to-gray-500">
                        GAMUT
                    </h1>
                    <p className="text-xl text-gray-400 max-w-md mx-auto">
                        Orchestrate your entire operation from a single command center.
                    </p>
                </div>

                {/* Abstract decorative elements */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-electric/20 rounded-full blur-3xl filter" />
                <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl filter" />
            </div>

            {/* Right Panel - Content */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                <div className="w-full max-w-lg">
                    {children}
                </div>
            </div>
        </div>
    );
};
