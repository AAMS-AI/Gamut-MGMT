import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import ClaimStatusBadge from '../components/ClaimStatusBadge';
import { Search, Filter, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreClaims, useFirestoreTeams } from '../hooks/useFirestore';

export default function ClaimsListPage() {
    const { user } = useAuth();
    const { claims: userVisibleClaims, loading } = useFirestoreClaims(user);
    const { teams } = useFirestoreTeams(user);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [teamFilter, setTeamFilter] = useState('all');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading claims...</p>
                </div>
            </div>
        );
    }

    // Then apply user's search/filter criteria
    const filteredClaims = userVisibleClaims.filter(claim => {
        const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
        const matchesTeam = teamFilter === 'all' || claim.teamId === teamFilter;
        return matchesSearch && matchesStatus && matchesTeam;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-100">Claims</h1>
                <p className="text-gray-500 mt-1">Manage and review insurance claims</p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search claims..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input pl-10"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="sent_to_insurance">Submitted</option>
                        </select>
                    </div>

                    {/* Team Filter */}
                    <div>
                        <select
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                            className="input"
                        >
                            <option value="all">All Teams</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredClaims.length}</span> of <span className="font-semibold">{userVisibleClaims.length}</span> claims
                </p>
            </div>

            {/* Claims Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Claim
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900 divide-y divide-gray-200">
                            {filteredClaims.map((claim) => {
                                const team = teams.find(t => t.id === claim.teamId);
                                return (
                                    <tr key={claim.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-100">{claim.title}</p>
                                                <p className="text-sm text-gray-500">{claim.claimNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-100">{team?.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-100">${claim.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ClaimStatusBadge status={claim.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500">
                                                {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/claims/${claim.id}`}
                                                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
