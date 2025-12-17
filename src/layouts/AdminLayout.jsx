import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import GlobalHeader from '../components/GlobalHeader';
import { Users, Hash, Building2, Settings } from 'lucide-react';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { to: '/users', icon: Users, label: 'Directory' },
        { to: '/teams', icon: Hash, label: 'Team Registry' },
        { to: '/organization', icon: Building2, label: 'Organization' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <GlobalHeader />
            <div className="flex flex-1 overflow-hidden">
                {/* Admin Sidebar */}
                <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col`}>
                    <div className="p-4 border-b border-slate-800/50">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Console</h2>
                    </div>
                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
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
