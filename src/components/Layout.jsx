import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreTeams } from '../hooks/useFirestore';
import {
    LayoutDashboard, Users, Building2, LogOut, ChevronLeft, ChevronRight,
    Settings, Briefcase, Plus, Hash
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Layout({ children }) {
    const { user, logout, loading, isOwner, isAdmin, isManager, userTeamId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Fetch Dynamic Data for Sidebar
    const { teams } = useFirestoreTeams(user);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter relevant teams for the sidebar
    const visibleTeams = useMemo(() => {
        if (!teams) return [];
        // Show ONLY the team the user is explicitly assigned to
        // This keeps the sidebar clean. Admins can view others via "All Teams" page.
        if (userTeamId) return teams.filter(t => String(t.id) === String(userTeamId));
        return [];
    }, [teams, userTeamId]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role === 'owner' && !user.organizationId) {
        return <Navigate to="/onboarding" />;
    }

    if (user.role === 'pending') {
        return <Navigate to="/pending" />;
    }

    // Helper for Links
    const SidebarLink = ({ to, icon: Icon, label, badge }) => {
        const isActive = location.pathname.startsWith(to) &&
            (to !== '/teams' || location.pathname === '/teams'); // Strict check for /teams vs /teams/123

        return (
            <Link
                to={to}
                className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative text-sm
                    ${isActive
                        ? 'bg-primary-500/10 text-primary-400 font-medium'
                        : 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'}
                `}
                title={!isSidebarOpen ? label : ''}
            >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-gray-300'}`} />
                <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    {label}
                </span>
                {badge && isSidebarOpen && (
                    <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-gray-500">{badge}</span>
                )}
            </Link>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                {/* 1. App Header */}
                <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 min-w-[2rem] bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <span className="text-lg font-bold text-white">G</span>
                        </div>
                        <div className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            <h1 className="text-lg font-bold text-gray-100 whitespace-nowrap tracking-tight">Gamut <span className="text-primary-500">.io</span></h1>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Content */}
                <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 px-3">

                    {/* Section: PERSONAL */}
                    <div className="space-y-1">
                        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Home" />
                    </div>

                    {/* Section: TEAMS */}
                    <div className="space-y-1">
                        {isSidebarOpen && (
                            <div className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 flex items-center justify-between">
                                <span>Teams</span>
                                {(isOwner || isAdmin) && (
                                    <Link to="/teams" className="hover:text-primary-400" title="Manage All Teams"><Settings size={12} /></Link>
                                )}
                            </div>
                        )}

                        {/* Dynamic Team List */}
                        {visibleTeams.map(team => (
                            <SidebarLink
                                key={team.id}
                                to={`/teams/${team.id}`}
                                icon={Hash}
                                label={team.name}
                            />
                        ))}

                        {/* Fallback if no team assigned */}
                        {visibleTeams.length === 0 && isSidebarOpen && (
                            <div className="px-3 py-2 text-xs text-slate-600 italic">
                                No teams assigned.
                            </div>
                        )}

                        {/* Admin Action: Create Team shortcut if needed, or link to full manager */}
                    </div>

                    {/* Section: ORGANIZATION (Directory, etc) - Separate from Teams */}
                    <div className="space-y-1">
                        {isSidebarOpen && <div className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 mt-2">Organization</div>}

                        <SidebarLink to="/teams" icon={Hash} label="All Teams" />
                        <SidebarLink to="/users" icon={Users} label="Directory" />

                        {(isOwner || isAdmin) && (
                            <SidebarLink to="/organization" icon={Building2} label="Settings" />
                        )}
                    </div>

                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-800">
                    <Link to="/profile" className={`flex items-center gap-3 mb-4 transition-all duration-200 hover:bg-slate-800 p-2 rounded-lg -mx-2 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 font-bold">
                            {user.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-100 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize truncate">{user.role?.replace('_', ' ')}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`
                            btn btn-secondary w-full flex items-center justify-center gap-2 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-all
                            ${!isSidebarOpen && 'px-0'}
                        `}
                        title="Logout"
                    >
                        <LogOut size={20} />
                        <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>Logout</span>
                    </button>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 text-gray-400 rounded-full p-1 hover:text-white hover:bg-slate-700 transition-colors hidden md:block"
                    >
                        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`
                    flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 overflow-x-hidden overflow-x-hidden
                    ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                    ml-20
                `}
            >
                {children}
            </main>
        </div>
    );
}
