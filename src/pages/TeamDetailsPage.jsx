import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Users, Briefcase, TrendingUp, DollarSign, Clock, CheckCircle,
    AlertCircle, Edit2, Trash2, Plus, X, UserMinus, Shield, LayoutDashboard,
    List, Settings as SettingsIcon, FileText, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getTeam, deleteTeam, updateTeam, adminUpdateUser, apiCall } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
// import ClaimStatusBadge from '../components/ClaimStatusBadge';

export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isManager, isAdmin, isOwner } = useAuth();

    // Hooks
    // const { claims } = useFirestoreClaims(user);

    // Local State
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('roster'); // roster, settings

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    // Forms
    const [formData, setFormData] = useState({ name: '', specialty: '', description: '' });
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

    // Derived Data


    const hasManagePermission = (isManager || isAdmin || isOwner) && user?.role !== 'member';

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const data = await getTeam(id);
            setTeam(data);
            setFormData({
                name: data.name,
                specialty: data.specialty,
                description: data.description || ''
            });
        } catch (err) {
            console.error("Failed to fetch team:", err);
            setError("Failed to load team details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const users = await apiCall('/users', 'GET');
            const currentMemberIds = team?.roster?.map(m => m.uid) || [];
            const available = users.filter(u => !currentMemberIds.includes(u.uid));
            setAvailableUsers(available);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        if (id) fetchTeam();
    }, [id]);

    useEffect(() => {
        if (isAddMemberModalOpen) fetchAvailableUsers();
    }, [isAddMemberModalOpen, team]);

    // Actions
    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        try {
            await updateTeam(id, formData);
            setTeam({ ...team, ...formData });
            setIsEditModalOpen(false);
        } catch (error) {
            alert("Failed to update team: " + error.message);
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
        try {
            await deleteTeam(id);
            navigate('/teams');
        } catch (error) {
            alert("Failed to delete team: " + error.message);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedUserToAdd) return;
        try {
            await adminUpdateUser(selectedUserToAdd, { teamId: id });
            setIsAddMemberModalOpen(false);
            fetchTeam();
            setSelectedUserToAdd('');
        } catch (error) {
            alert("Failed to add member: " + error.message);
        }
    };

    const handleRemoveMember = async (uid) => {
        if (!window.confirm("Are you sure you want to remove this user from the team?")) return;
        try {
            await adminUpdateUser(uid, { teamId: null });
            fetchTeam();
        } catch (error) {
            alert("Failed to remove member: " + error.message);
        }
    };

    const handleChangeRole = async (uid, newRole) => {
        try {
            await adminUpdateUser(uid, { role: newRole });
            fetchTeam();
        } catch (error) {
            alert("Failed to change role: " + error.message);
        }
    };

    // Visualization Data
    // const statusData = [];
    // const memberInitiatedClaims = [];

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
    );

    if (error || !team) return (
        <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-gray-300 mb-2">Error</h3>
            <p className="text-gray-500">{error || "Team not found"}</p>
            <button onClick={() => navigate('/teams')} className="btn btn-ghost mt-4">Back to Teams</button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Top Navigation / Breadcrumbs - Removed as this is the root view of the Team Context */}
            {/* <div className="flex items-center gap-4 text-sm text-gray-400">
                <Link to="/teams" className="hover:text-gray-200 flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Teams
                </Link>
                <span>/</span>
                <span className="text-gray-200 font-medium">{team.name} Manager</span>
            </div> */}

            {/* Header Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-100">{team.name}</h1>
                            <span className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs rounded uppercase tracking-wider font-semibold">
                                {team.specialty}
                            </span>
                        </div>
                        <p className="text-gray-400 mt-2 max-w-3xl">{team.description}</p>
                    </div>
                </div>

                {/* KPI Stripes */}
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Team Lead</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center font-bold">
                            {getInitials(team.roster?.find(m => m.role === 'manager')?.displayName || 'Unknown')}
                        </div>
                        <p className="text-lg font-bold text-white">
                            {team.roster?.find(m => m.role === 'manager')?.displayName || 'TBD'}
                        </p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-700 mx-6 hidden md:block"></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Team Size</p>
                    <p className="text-2xl font-bold text-white mt-1">{team.roster?.length || 0} Member{team.roster?.length !== 1 && 's'}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-700">
                <div className="flex gap-6 overflow-x-auto">
                    {[
                        // { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'roster', label: 'Roster', icon: Users },
                        // { id: 'workload', label: 'Workload', icon: FileText },
                        { id: 'settings', label: 'Settings', icon: SettingsIcon },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors relative
                                ${activeTab === tab.id ? 'text-primary-400' : 'text-gray-400 hover:text-gray-200'}
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* OVERVIEW TAB */}
                {/* OVERVIEW TAB - Disabled */}

                {/* ROSTER TAB */}
                {activeTab === 'roster' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Team Members</h2>
                            {hasManagePermission && (
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add Member
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 text-xs uppercase text-gray-400 border-b border-slate-700">
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Job Title</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {(team.roster || [])
                                        .sort((a, b) => {
                                            const rolePriority = { 'manager': 0, 'lead': 1, 'member': 2 };
                                            return (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99);
                                        })
                                        .map((member) => (
                                            <tr key={member.uid} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                            {getInitials(member.displayName)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-200">{member.displayName}</p>
                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {hasManagePermission ? (
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => handleChangeRole(member.uid, e.target.value)}
                                                            className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-primary-500"
                                                        >
                                                            <option value="member">Member</option>
                                                            <option value="lead">Lead</option>
                                                            <option value="manager">Manager</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-sm text-gray-300 capitalize">{member.role?.replace('_', ' ')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                    {member.jobTitle || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {hasManagePermission && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.uid)}
                                                            className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded hover:bg-slate-800"
                                                            title="Remove from Team"
                                                        >
                                                            <UserMinus size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    {(!team.roster || team.roster.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No members found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* WORKLOAD TAB */}
                {/* WORKLOAD TAB - Disabled */}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Team Settings</h3>

                            <form onSubmit={(e) => {
                                handleUpdateTeam(e);
                                alert("Settings saved."); // Simple feedback
                            }} className="space-y-4">
                                <div>
                                    <label className="label">Team Name</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!hasManagePermission}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Specialty</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                        disabled={!hasManagePermission}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <textarea
                                        className="input w-full min-h-[100px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={!hasManagePermission}
                                    />
                                </div>
                                {hasManagePermission && (
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {hasManagePermission && (
                            <div className="mt-8 bg-red-950/20 border border-red-500/20 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                                <p className="text-sm text-gray-400 mb-6">Deleting a team will unassign all members and claims. This action cannot be undone.</p>
                                <button
                                    onClick={handleDeleteTeam}
                                    className="btn bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Team
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Member Modal (Reused) */}
            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Team Member">
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                        <label className="label">Select User</label>
                        <select
                            className="input w-full"
                            value={selectedUserToAdd}
                            onChange={(e) => setSelectedUserToAdd(e.target.value)}
                            required
                        >
                            <option value="">-- Select a user --</option>
                            {availableUsers.map(u => (
                                <option key={u.uid} value={u.uid}>
                                    {u.displayName} ({u.email})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Only users not currently assigned to this team are shown.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsAddMemberModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={!selectedUserToAdd}>Add Member</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
