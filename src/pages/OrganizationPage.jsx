import { mockOrganization, mockTeams, mockClaims } from '../data/mockData';
import { Building2, Users, FileText, TrendingUp, Calendar } from 'lucide-react';

export default function OrganizationPage() {
    const totalTeams = mockTeams.length;
    const totalMembers = mockTeams.reduce((sum, team) => sum + team.memberCount, 0);
    const totalClaims = mockClaims.length;
    const totalAmount = mockClaims.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-100">Organization</h1>
                <p className="text-gray-500 mt-1">Organization overview and settings</p>
            </div>

            {/* Organization Header */}
            <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-slate-900/20 p-4 rounded-xl">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">{mockOrganization.name}</h2>
                        <p className="text-primary-100">Restoration Services Company</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-primary-100 text-sm">Teams</p>
                        <p className="text-2xl font-bold">{totalTeams}</p>
                    </div>
                    <div>
                        <p className="text-primary-100 text-sm">Team Members</p>
                        <p className="text-2xl font-bold">{totalMembers}</p>
                    </div>
                    <div>
                        <p className="text-primary-100 text-sm">Total Claims</p>
                        <p className="text-2xl font-bold">{totalClaims}</p>
                    </div>
                    <div>
                        <p className="text-primary-100 text-sm">Total Amount</p>
                        <p className="text-2xl font-bold">${(totalAmount / 1000).toFixed(0)}K</p>
                    </div>
                </div>
            </div>

            {/* Organization Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Organization Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-700">
                            <span className="text-gray-400">Organization ID</span>
                            <span className="font-medium text-gray-100">{mockOrganization.id}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700">
                            <span className="text-gray-400">Name</span>
                            <span className="font-medium text-gray-100">{mockOrganization.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700">
                            <span className="text-gray-400">Timezone</span>
                            <span className="font-medium text-gray-100">{mockOrganization.settings.timezone}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700">
                            <span className="text-gray-400">Currency</span>
                            <span className="font-medium text-gray-100">{mockOrganization.settings.currency}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-400">Created</span>
                            <span className="font-medium text-gray-100">
                                {new Date(mockOrganization.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <Users className="text-blue-400" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Active Teams</p>
                                <p className="text-xl font-bold text-gray-100">{totalTeams}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="bg-green-500/20 p-2 rounded-lg">
                                <FileText className="text-green-400" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Total Claims Processed</p>
                                <p className="text-xl font-bold text-gray-100">{totalClaims}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <TrendingUp className="text-purple-400" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Total Claim Value</p>
                                <p className="text-xl font-bold text-gray-100">${totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teams Overview */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Teams Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockTeams.map((team) => (
                        <div key={team.id} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <Users className="text-primary-600" size={16} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-100">{team.name}</p>
                                    <p className="text-xs text-gray-500">{team.specialty}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Members</span>
                                <span className="font-semibold text-gray-100">{team.memberCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
