import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import ClaimStatusBadge from '../components/ClaimStatusBadge';
import KanbanBoard from '../components/KanbanBoard';
import { Search, Filter, Eye, LayoutGrid, List as ListIcon, Map as MapIcon, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreClaims, useFirestoreTeams, useFirestoreUsers } from '../hooks/useFirestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '../components/Modal';

// Fix for default marker icon in leaflet with webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function ClaimsListPage() {
    const { user, isManager, isOrgOwner, userTeamId } = useAuth();
    const { claims: userVisibleClaims, loading } = useFirestoreClaims(user);
    const { teams } = useFirestoreTeams(user);
    const { users } = useFirestoreUsers(user);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [teamFilter, setTeamFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban' | 'map'

    // Create Job State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        address: '',
        assignedTo: ''
    });

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

    // Filter team members based on user's team (for assignment)
    const teamMembers = users.filter(u => {
        // If Admin/Owner, show all members? Or allow picking a team first?
        // For Manager, show only their team.
        if (isOrgOwner) return true; // Show all
        if (userTeamId) return u.teamId === userTeamId;
        return false;
    });

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            // Generate Claim Number (Simple logic)
            const claimNumber = `JOB-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

            await addDoc(collection(db, 'claims'), {
                title: newJob.title,
                description: newJob.description,
                claimNumber: claimNumber,
                amount: 0, // Initial estimate?
                status: 'pending_review', // Initial status per requirements
                teamId: userTeamId || teams[0]?.id, // Default to user's team or first available
                submittedBy: user.uid,
                assignedTo: newJob.assignedTo || null,
                metadata: {
                    address: newJob.address,
                    incidentDate: new Date().toISOString()
                },
                lineItems: [],
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                organizationId: user.organizationId
            });

            setIsCreateModalOpen(false);
            setNewJob({ title: '', description: '', address: '', assignedTo: '' });
            // Ideally show success toast
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to create job: " + error.message);
        }
    };

    // Then apply user's search/filter criteria
    const filteredClaims = userVisibleClaims.filter(claim => {
        const matchesSearch = claim.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
        const matchesTeam = teamFilter === 'all' || claim.teamId === teamFilter;
        return matchesSearch && matchesStatus && matchesTeam;
    });

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-theme(spacing.24))]">
            <div className="flex-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100">Claims & Jobs</h1>
                        <p className="text-gray-500 mt-1">Manage and review jobs and claims</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Create Job Button - Manager/Owner Only */}
                        {(isManager || isOrgOwner) && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create Job
                            </button>
                        )}

                        {/* View Toggles */}
                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <ListIcon size={16} />
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <LayoutGrid size={16} />
                                Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <MapIcon size={16} />
                                Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mt-6">
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
                <div className="flex items-center justify-between mt-4 mb-2">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredClaims.length}</span> of <span className="font-semibold">{userVisibleClaims.length}</span> claims
                    </p>
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                {viewMode === 'list' && (
                    <div className="card p-0 h-full flex flex-col border-none shadow-none bg-transparent">
                        <div className="overflow-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-slate-800/50 border-b border-slate-700 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Job / Claim
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Team
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-900 divide-y divide-gray-200">
                                    {filteredClaims.map((claim) => {
                                        const team = teams.find(t => t.id === claim.teamId);
                                        const assignee = users.find(u => u.uid === claim.assignedTo || u.id === claim.assignedTo);
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
                                                    <ClaimStatusBadge status={claim.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    {assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                                                {(assignee.displayName || 'U').charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-gray-200">{assignee.displayName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500">
                                                        {claim.submittedAt ? new Date(claim.submittedAt.seconds * 1000).toLocaleDateString() : '-'}
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
                )}

                {viewMode === 'kanban' && (
                    <KanbanBoard claims={filteredClaims} />
                )}

                {viewMode === 'map' && (
                    <div className="card h-full p-0 overflow-hidden border border-slate-700 rounded-xl relative">
                        <MapContainer
                            center={[39.8283, -98.5795]} // Center of USA approx
                            zoom={4}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredClaims.map(claim => {
                                // Mock lat/long for now if not present, scattered around US center
                                // In production you'd use claim.location.lat/lng
                                const hasLocation = claim.location?.lat && claim.location?.lng;
                                const lat = hasLocation ? claim.location.lat : 39.8283 + (Math.random() - 0.5) * 10;
                                const lng = hasLocation ? claim.location.lng : -98.5795 + (Math.random() - 0.5) * 20;

                                return (
                                    <Marker key={claim.id} position={[lat, lng]}>
                                        <Popup>
                                            <div className="text-slate-900">
                                                <strong className="block text-sm mb-1">{claim.title}</strong>
                                                <span className="text-xs block mb-2">{claim.claimNumber}</span>
                                                <Link to={`/claims/${claim.id}`} className="text-blue-600 hover:underline text-xs">
                                                    View Claim
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                        {!filteredClaims.some(c => c.location) && (
                            <div className="absolute top-4 right-4 bg-slate-900/90 text-yellow-400 px-4 py-2 rounded-lg text-xs z-[1000] border border-yellow-500/30">
                                Note: Most claims shown with mock locations
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Job Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Job (NOFL)">
                <form onSubmit={handleCreateJob} className="space-y-4">
                    <div>
                        <label className="label">Job Title</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={newJob.title}
                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            placeholder="e.g. Water Damage - 123 Main St"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Property Address</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={newJob.address}
                            onChange={(e) => setNewJob({ ...newJob, address: e.target.value })}
                            placeholder="123 Main St, Springfield"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input w-full min-h-[100px]"
                            value={newJob.description}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            placeholder="Describe the loss details..."
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Assign To (Optional)</label>
                        <select
                            className="input w-full"
                            value={newJob.assignedTo}
                            onChange={(e) => setNewJob({ ...newJob, assignedTo: e.target.value })}
                        >
                            <option value="">-- Unassigned --</option>
                            {teamMembers.map(member => (
                                <option key={member.id || member.uid} value={member.id || member.uid}>
                                    {member.displayName} ({member.role})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Assign to a member of your team now or later.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Job</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
