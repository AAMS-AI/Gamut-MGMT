import React from 'react';
import GlobalHeader from '../components/GlobalHeader';

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <GlobalHeader />
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
