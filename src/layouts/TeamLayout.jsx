import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import GlobalHeader from '../components/GlobalHeader';
import { LayoutDashboard, Users, Settings, FileText, Activity } from 'lucide-react';
import { useFirestoreTeams } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

export default function TeamLayout({ children }) {
    const { id } = useParams();
    const { user } = useAuth();
    const { teams } = useFirestoreTeams(user);

    const team = teams?.find(t => String(t.id) === String(id));

    if (!team && teams?.length > 0) {
        // Loading or not found logic handled by page usually, but layout should be safe
    }

    const navItems = [
        { to: `/teams/${id}`, end: true, icon: Activity, label: 'Workspace' },
        // { to: `/teams/${id}/claims`, icon: FileText, label: 'Claims' }, // Placeholder for future
        // { to: `/teams/${id}/roster`, icon: Users, label: 'Roster' },    // Placeholder/Future split
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <GlobalHeader />
            <div className="flex flex-1 overflow-hidden">
                {/* Team Sidebar */}
                <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col`}>
                    <div className="p-4 border-b border-slate-800/50">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Team Workspace</h2>
                        <div className="text-sm font-bold text-gray-100 truncate">{team?.name || 'Loading...'}</div>
                    </div>
                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                                    ${isActive
                                        ? 'bg-primary-500/10 text-primary-400'
                                        : 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'}
                                `}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
