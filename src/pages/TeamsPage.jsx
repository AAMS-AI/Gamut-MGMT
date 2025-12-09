import { Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreClaims, useFirestoreTeams } from '../hooks/useFirestore';

export default function TeamsPage() {
    const { user } = useAuth();
    const { teams: visibleTeams, loading: teamsLoading } = useFirestoreTeams(user);
    const { claims, loading: claimsLoading } = useFirestoreClaims(user);

    if (teamsLoading || claimsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading teams...</p>
                </div>
            </div>
        );
    }

    const teamsWithStats = visibleTeams.map(team => {
        const teamClaims = claims.filter(c => c.teamId === team.id);
        const completedClaims = teamClaims.filter(c => c.status === 'sent_to_insurance').length;
        const pendingClaims = teamClaims.filter(c => c.status === 'pending_review' || c.status === 'under_review').length;
        const totalAmount = teamClaims.reduce((sum, c) => sum + c.amount, 0);

        return {
            ...team,
            totalClaims: teamClaims.length,
            completedClaims,
            pendingClaims,
            totalAmount,
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-100">Teams</h1>
                <p className="text-gray-500 mt-1">Manage teams and view performance metrics</p>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamsWithStats.map((team) => (
                    <div key={team.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">{team.name}</h3>
                                <p className="text-sm text-gray-500">{team.specialty}</p>
                            </div>
                            <div className="bg-primary-100 p-2 rounded-lg">
                                <Users className="text-primary-600" size={20} />
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Team Members</span>
                                <span className="font-semibold text-gray-100">{team.memberCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Total Claims</span>
                                <span className="font-semibold text-gray-100">{team.totalClaims}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Pending</span>
                                <span className="font-semibold text-yellow-400">{team.pendingClaims}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Completed</span>
                                <span className="font-semibold text-green-400">{team.completedClaims}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Total Amount</span>
                                <span className="text-lg font-bold text-primary-600">${team.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Performance Summary */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Team Performance Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Claims</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900 divide-y divide-gray-200">
                            {teamsWithStats.map((team) => (
                                <tr key={team.id} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-100">{team.name}</p>
                                            <p className="text-sm text-gray-500">{team.specialty}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-100">{team.memberCount}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-100">{team.totalClaims}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-yellow-400">{team.pendingClaims}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-400">{team.completedClaims}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-primary-600">${team.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
