import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
// import ClaimStatusBadge from '../components/ClaimStatusBadge';
import AdminUserManagement from '../components/AdminUserManagement';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreTeams } from '../hooks/useFirestore';

export default function DashboardPage() {
    const { user, isOwner, isAdmin } = useAuth();
    // const { claims: visibleClaims, loading: claimsLoading } = useFirestoreClaims(user);
    const { teams: visibleTeams, loading: teamsLoading } = useFirestoreTeams(user);

    if (teamsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Claims Stats disabled
    const stats = [
        // { label: 'Total Claims', value: totalClaims, icon: FileText, color: 'primary', bgColor: 'bg-primary-500/20', textColor: 'text-primary-400', borderColor: 'border-primary-500/30' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Dashboard</h1>
                <p className="text-gray-400 mt-1">AI-powered overview of claims and team performance</p>
            </div>

            {/* Dashboard Content - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Welcome Card */}
                <div className="card col-span-full md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-2xl font-bold">
                            {(user?.displayName || 'U').charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.displayName?.split(' ')[0]}!</h2>
                            <p className="text-gray-400">
                                {user?.role === 'owner' ? 'Organization Owner' :
                                    user?.role === 'admin' ? 'Administrator' :
                                        user?.role === 'manager' ? 'Manager' : 'Team Member'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Context-Aware Team Cards */}
                <div className="col-span-full">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Your Workspaces</h3>
                    {visibleTeams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleTeams.map(team => (
                                <Link
                                    key={team.id}
                                    to={`/teams/${team.id}`}
                                    className="card bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-primary-500/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-gray-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                                            <Users size={24} />
                                        </div>
                                        <div className="px-2 py-1 bg-slate-900 rounded text-xs text-gray-500 font-mono">
                                            {team.id.substring(0, 6)}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{team.name}</h4>
                                    <p className="text-sm text-gray-400 line-clamp-2">{team.description || 'No description provided.'}</p>

                                    <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 border-t border-slate-700/50 pt-4">
                                        <div className="flex items-center gap-1">
                                            <Users size={12} />
                                            <span>{team.roster?.length || 0} Members</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-auto text-primary-500 group-hover:translate-x-1 transition-transform">
                                            <span>Enter Workspace</span>
                                            <TrendingUp size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center">
                            <p className="text-gray-500">You are not assigned to any teams yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AdminUserManagement - Visible to Admin, Owner & Manager */}
            {(isAdmin || isOwner || user?.role === 'manager') && (
                <div className="card">
                    <AdminUserManagement />
                </div>
            )}
        </div>
    );
}
