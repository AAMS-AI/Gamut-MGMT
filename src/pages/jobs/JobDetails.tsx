import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { type Job, type JobAssignments } from '@/types/jobs';
import { type UserProfile } from '@/types/team';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Calendar,
    Users,
    ShieldAlert,
    Save,
    Pencil
} from 'lucide-react';
import { JobCreate } from './JobCreate';

export const JobDetails: React.FC = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);

    // Assignment Editing State
    const [isEditingAssignments, setIsEditingAssignments] = useState(false);
    const [assignments, setAssignments] = useState<JobAssignments>({});
    const [saving, setSaving] = useState(false);

    // Full Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (!jobId || !profile?.orgId) return;

        // Fetch Job
        const unsubJob = onSnapshot(doc(db, 'jobs', jobId), (doc) => {
            if (doc.exists()) {
                const jobData = { id: doc.id, ...doc.data() } as Job;
                setJob(jobData);
                // Initialize local assignment state
                setAssignments(jobData.assignments || {});
            } else {
                setJob(null);
            }
            setLoading(false);
        });

        // Fetch Users (for dropdowns)
        const qUsers = query(collection(db, 'users'), where('orgId', '==', profile.orgId));
        const unsubUsers = onSnapshot(qUsers, (snap) => {
            setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        });

        return () => {
            unsubJob();
            unsubUsers();
        };
    }, [jobId, profile?.orgId]);

    const handleSaveAssignments = async () => {
        if (!jobId || !job) return;
        setSaving(true);
        try {
            // Update Firestore
            const assignedIds = new Set<string>();
            if (assignments.supervisorId) assignedIds.add(assignments.supervisorId);
            if (assignments.leadTechnicianId) assignedIds.add(assignments.leadTechnicianId);
            assignments.teamMemberIds?.forEach(id => assignedIds.add(id));

            await updateDoc(doc(db, 'jobs', jobId), {
                assignments: assignments,
                assignedUserIds: Array.from(assignedIds)
            });
            setIsEditingAssignments(false);
        } catch (error) {
            console.error("Error updating assignments:", error);
            // Ideally show toast error
        } finally {
            setSaving(false);
        }
    };

    const isManagerOrAdmin = profile && ['OWNER', 'ORG_ADMIN', 'OFFICE_ADMIN', 'DEPT_MANAGER'].includes(profile.role);

    if (loading) return <div className="p-10 text-accent-electric animate-pulse">Loading Job Details...</div>;
    if (!job) return <div className="p-10 text-red-500">Job not found.</div>;

    const leadTech = users.find(u => u.uid === job.assignments?.leadTechnicianId);
    const supervisor = users.find(u => u.uid === job.assignments?.supervisorId);

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{job.customer.name}</h1>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-text-secondary border border-white/10">
                            {job.status}
                        </span>
                    </div>
                    <p className="text-text-muted flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-accent-primary" />
                        {job.property.address}, {job.property.city}, {job.property.state}
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex gap-3">
                {isManagerOrAdmin && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-white font-bold text-sm"
                    >
                        <Pencil size={16} />
                        Edit Job
                    </button>
                )}
            </div>

            {/* Edit Modal */}
            {
                showEditModal && job && (
                    <JobCreate
                        onClose={() => setShowEditModal(false)}
                        initialData={job}
                        jobId={job.id}
                    />
                )
            }

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Info Card */}
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-2 text-accent-electric mb-4">
                            <Briefcase size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Job Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase block mb-1">Insurance Carrier</label>
                                <div className="text-white text-lg font-medium">{job.insurance.carrier || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase block mb-1">Claim Number</label>
                                <div className="text-white text-lg font-medium font-mono">{job.insurance.claimNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase block mb-1">Date of Loss</label>
                                <div className="text-white font-medium flex items-center gap-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    {job.dates?.lossDate ? new Date(job.dates.lossDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase block mb-1">FNOL Received</label>
                                <div className="text-white font-medium flex items-center gap-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    {job.dates?.fnolReceivedDate ? new Date(job.dates.fnolReceivedDate.seconds * 1000).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {job.details.lossDescription && (
                            <div className="pt-4 border-t border-white/5">
                                <label className="text-xs font-bold text-text-muted uppercase block mb-2">Description of Loss</label>
                                <p className="text-text-secondary leading-relaxed bg-black/20 p-4 rounded-xl text-sm">
                                    {job.details.lossDescription}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Team & Actions */}
                <div className="space-y-6">

                    {/* Team Assignments Card */}
                    <div className={`glass p-6 rounded-2xl border ${!leadTech ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-white/5'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-accent-primary">
                                <Users size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Job Team</h3>
                            </div>
                            {!isEditingAssignments && isManagerOrAdmin && (
                                <button
                                    onClick={() => setIsEditingAssignments(true)}
                                    className="text-xs font-bold text-accent-electric hover:underline"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Assignments View Mode */}
                        {!isEditingAssignments ? (
                            <div className="space-y-4">
                                {/* Lead Tech Display */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase block mb-2">Lead Technician</label>
                                    {leadTech ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-electric text-black flex items-center justify-center font-bold">
                                                {leadTech.displayName[0]}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm">{leadTech.displayName}</div>
                                                <div className="text-xs text-text-secondary">{leadTech.role}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <ShieldAlert size={16} />
                                            <span className="text-sm font-bold">Unassigned</span>
                                        </div>
                                    )}
                                </div>

                                {/* Supervisor Display */}
                                <div className="flex items-center gap-3 p-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                                        {supervisor?.displayName[0] || '?'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-text-secondary">Supervisor</div>
                                        <div className="text-white font-bold text-sm">{supervisor?.displayName || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Assignments Edit Mode */
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase">Lead Technician</label>
                                    <select
                                        value={assignments.leadTechnicianId || ''}
                                        onChange={(e) => setAssignments(prev => ({ ...prev, leadTechnicianId: e.target.value }))}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent-electric outline-none"
                                    >
                                        <option value="">Select Lead Tech...</option>
                                        {users
                                            .filter(u => !['DEPT_MANAGER', 'OFFICE_ADMIN', 'ORG_ADMIN', 'OWNER'].includes(u.role))
                                            .map(u => (
                                                <option key={u.uid} value={u.uid}>{u.displayName}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Add more robust assignment editing here if needed (e.g. team members) */}

                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={handleSaveAssignments}
                                        disabled={saving}
                                        className="flex-1 bg-accent-electric text-black font-bold py-2 rounded-lg text-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saving ? 'Saving...' : <><Save size={14} /> Save Assignment</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingAssignments(false);
                                            // Revert local state
                                            setAssignments(job.assignments || {});
                                        }}
                                        className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Actions */}
                    <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                        <p className="text-sm text-text-muted mb-4">Job is currently in <strong>{job.status}</strong></p>
                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                            Manage Status
                        </button>
                    </div>

                </div>
            </div>
        </div >
    );
};
