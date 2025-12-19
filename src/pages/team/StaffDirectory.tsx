import React from 'react';
import { Users } from 'lucide-react';

export const StaffDirectory: React.FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <div className="text-accent-electric text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14} /> Team Management
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Staff Roster</h1>
                <p className="text-text-secondary mt-2">Manage your office personnel and assignments.</p>
            </header>

            <div className="glass p-16 text-center text-text-muted">
                Roster Table Coming Soon...
            </div>
        </div>
    );
};
