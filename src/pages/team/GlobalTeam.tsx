import React from 'react';
import { Users } from 'lucide-react';

export const GlobalTeam: React.FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <div className="text-accent-electric text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14} /> Global Directory
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">All Enterprise Users</h1>
            </header>

            <div className="glass p-16 text-center text-text-muted">
                Global User Search Coming Soon...
            </div>
        </div>
    );
};
