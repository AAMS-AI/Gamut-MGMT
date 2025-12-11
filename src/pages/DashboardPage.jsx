import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import ClaimStatusBadge from '../components/ClaimStatusBadge';
import AdminUserManagement from '../components/AdminUserManagement';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreClaims, useFirestoreTeams } from '../hooks/useFirestore';

export default function DashboardPage() {
    const { user, hasAdminRights, isOrgOwner } = useAuth();
    const { claims: visibleClaims, loading: claimsLoading } = useFirestoreClaims(user);
    const { teams: visibleTeams, loading: teamsLoading } = useFirestoreTeams(user);

    if (claimsLoading || teamsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculate statistics from visible claims only
    const totalClaims = visibleClaims.length;
    const pendingClaims = visibleClaims.filter(c => c.status === 'pending_review' || c.status === 'under_review').length;
    const approvedClaims = visibleClaims.filter(c => c.status === 'approved' || c.status === 'sent_to_insurance').length;
    const rejectedClaims = visibleClaims.filter(c => c.status === 'rejected').length;
    const totalAmount = visibleClaims.reduce((sum, c) => sum + c.amount, 0);

    // "Needs Attention" Logic
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const needsAttentionClaims = visibleClaims.filter(c => {
        const isStuckPending = (c.status === 'pending_review' || c.status === 'under_review') &&
            c.submittedAt && new Date(c.submittedAt) < twoDaysAgo;
        const isRevisionRequested = c.status === 'revision_requested';
        const isRejected = c.status === 'rejected'; // Rejections also need action
        return isStuckPending || isRevisionRequested || isRejected;
    });

    // Velocity Logic (Claims approved in last 7 days vs previous 7 days)
    // Simplified for now to just show a mock trend or actual if date data exists
    // Lets generate "Claims Approved per Day" for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const velocityData = last7Days.map(dateStr => {
        const count = visibleClaims.filter(c => {
            if (c.status !== 'approved' && c.status !== 'sent_to_insurance') return false;
            if (!c.updatedAt) return false;
            // Assuming updatedAt tracks approval time for now
            return new Date(c.updatedAt).toISOString().split('T')[0] === dateStr;
        }).length;
        return { date: dateStr.slice(5), count }; // MM-DD
    });


    // Claims by team (only visible teams)
    const claimsByTeam = visibleTeams.map(team => ({
        name: team.name.replace(' Team', ''),
        claims: visibleClaims.filter(c => c.teamId === team.id).length,
    }));

    // Claims by status for pie chart (only visible claims)
    const claimsByStatus = [
        { name: 'Pending Review', value: visibleClaims.filter(c => c.status === 'pending_review').length, color: '#eab308' },
        { name: 'Under Review', value: visibleClaims.filter(c => c.status === 'under_review').length, color: '#a855f7' },
        { name: 'Approved', value: visibleClaims.filter(c => c.status === 'approved').length, color: '#22c55e' },
        { name: 'Submitted', value: visibleClaims.filter(c => c.status === 'sent_to_insurance').length, color: '#06b6d4' },
        { name: 'Rejected', value: visibleClaims.filter(c => c.status === 'rejected').length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Recent claims (only visible claims)
    const recentClaims = [...visibleClaims]
        .sort((a, b) => new Date(b.updatedAt || b.submittedAt) - new Date(a.updatedAt || a.submittedAt))
        .slice(0, 5);

    const stats = [
        { label: 'Total Claims', value: totalClaims, icon: FileText, color: 'primary', bgColor: 'bg-primary-500/20', textColor: 'text-primary-400', borderColor: 'border-primary-500/30' },
        { label: 'Pending Review', value: pendingClaims, icon: Clock, color: 'yellow', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30' },
        { label: 'Approved', value: approvedClaims, icon: CheckCircle, color: 'green', bgColor: 'bg-green-500/20', textColor: 'text-green-400', borderColor: 'border-green-500/30' },
        { label: 'Rejected', value: rejectedClaims, icon: XCircle, color: 'red', bgColor: 'bg-red-500/100/20', textColor: 'text-red-400', borderColor: 'border-red-500/30' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Dashboard</h1>
                <p className="text-gray-400 mt-1">AI-powered overview of claims and team performance</p>
            </div>

            {/* Action Center - Needs Attention */}
            {needsAttentionClaims.length > 0 && (
                <div className="card bg-orange-950/20 border-orange-500/30">
                    <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Action Required ({needsAttentionClaims.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {needsAttentionClaims.slice(0, 3).map(claim => (
                            <Link to={`/claims/${claim.id}`} key={claim.id} className="block group">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-orange-500/20 hover:border-orange-500/50 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-200 group-hover:text-orange-300 transition-colors">{claim.title}</p>
                                            <p className="text-xs text-gray-500">{claim.claimNumber} • {visibleTeams.find(t => t.id === claim.teamId)?.name || 'No Team'}</p>
                                        </div>
                                        <ClaimStatusBadge status={claim.status} />
                                    </div>
                                    <p className="text-xs text-orange-400/80 mt-2">
                                        {claim.status === 'revision_requested' ? 'Returned for revision' :
                                            claim.status === 'rejected' ? 'Claim Rejected' : 'Pending > 48 hours'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className={`card border ${stat.borderColor} ${stat.bgColor}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                            </div>
                            <div className={`${stat.bgColor} p-3 rounded-lg border ${stat.borderColor}`}>
                                <stat.icon className={stat.textColor} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Amount Card */}
            <div className="card bg-gradient-to-br from-primary-600/20 to-accent-600/20 border-primary-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total Claim Amount</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mt-2">${totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-primary-500/20 p-3 rounded-lg border border-primary-500/30">
                        <TrendingUp className="text-primary-400" size={32} />
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claims by Team */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-primary-400" />
                        Claims by Team
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={claimsByTeam}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#64748b" interval={0} fontSize={12} />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#e2e8f0' }}
                                itemStyle={{ color: '#06b6d4' }}
                            />
                            <Bar dataKey="claims" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Team Velocity (New) */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-400" />
                        Approval Velocity (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={velocityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#e2e8f0' }}
                                itemStyle={{ color: '#22c55e' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Claims by Status */}
                <div className="card lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-accent-400" />
                        Status Distribution
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={claimsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    // label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {claimsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentClaims.length > 0 ? recentClaims.map((claim) => (
                            <div key={claim.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-primary-500/30 transition-all">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-100">{claim.title}</p>
                                    <p className="text-sm text-gray-500">{claim.claimNumber}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-semibold text-primary-400">${claim.amount.toLocaleString()}</p>
                                    <ClaimStatusBadge status={claim.status} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin User Management */}
            {(hasAdminRights || isOrgOwner) && (
                <div className="card">
                    <AdminUserManagement />
                </div>
            )}
        </div>
    );
}
