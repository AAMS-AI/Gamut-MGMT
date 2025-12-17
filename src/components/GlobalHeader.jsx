import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreTeams } from '../hooks/useFirestore';
import {
    LayoutDashboard, Users, ChevronDown, LogOut,
    Building2, Settings, Shield, Menu, X, Hash
} from 'lucide-react';

export default function GlobalHeader({ toggleSidebar }) {
    const { user, logout, isOwner, isAdmin, userTeamId } = useAuth();
    const { teams } = useFirestoreTeams(user);
    const navigate = useNavigate();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Filter teams for the interaction menu
    // Admins see all, Members see theirs
    const requestableTeams = (isOwner || isAdmin)
        ? teams
        : teams?.filter(t => String(t.id) === String(userTeamId)) || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentContext = () => {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/users') || location.pathname.startsWith('/organization')) return 'Organization';
        if (location.pathname.startsWith('/teams/')) {
            const teamId = location.pathname.split('/')[2];
            const team = teams?.find(t => String(t.id) === String(teamId));
            return team ? team.name : 'Team Context';
        }
        return 'Personal Workspace';
    };

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50 relative">
            {/* Left: Branding & Context Switcher */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded-lg transition-colors group"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <span className="text-lg font-bold text-white">G</span>
                    </div>
                    <div className="hidden md:block text-left">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Context</div>
                        <div className="text-sm font-bold text-gray-100 flex items-center gap-2">
                            {currentContext()}
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </button>

                {/* Context Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute top-16 left-4 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">

                            {/* Personal */}
                            <div className="p-2">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="p-2 bg-blue-500/10 rounded-md text-blue-400 group-hover:bg-blue-500/20"><LayoutDashboard size={18} /></div>
                                    <div>
                                        <div className="font-medium text-gray-200">Personal Workspace</div>
                                        <div className="text-xs text-gray-500">My Dashboard & Tasks</div>
                                    </div>
                                </Link>
                            </div>

                            <div className="h-px bg-slate-800 mx-2"></div>

                            {/* Organization (Admins Only) */}
                            {(isOwner || isAdmin) && (
                                <div className="p-2">
                                    <div className="px-3 py-1 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Administration</div>
                                    <Link
                                        to="/organization"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="p-2 bg-purple-500/10 rounded-md text-purple-400 group-hover:bg-purple-500/20"><Building2 size={18} /></div>
                                        <div>
                                            <div className="font-medium text-gray-200">Organization Console</div>
                                            <div className="text-xs text-gray-500">Global Settings & Directory</div>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            <div className="h-px bg-slate-800 mx-2"></div>

                            {/* Teams */}
                            <div className="p-2 flex-1 overflow-y-auto">
                                <div className="px-3 py-1 text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Teams</div>
                                {requestableTeams.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-slate-600 italic">No teams available</div>
                                ) : (
                                    requestableTeams.map(team => (
                                        <Link
                                            key={team.id}
                                            to={`/teams/${team.id}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                                                <Hash size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">{team.name}</span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Right: User Profile */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-gray-200">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-500 font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
