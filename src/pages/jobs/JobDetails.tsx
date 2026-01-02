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
    Users,
    ShieldAlert,
    Pencil,
    BrainCircuit
} from 'lucide-react';
import { ClaimAnalysis } from './components/ClaimAnalysis';
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

            {/* Dashboard Grid Layout */}
            <div className="space-y-8">

                {/* Top Statistics & Information Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. Insurance & Dates Card */}
                    <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-accent-electric mb-4">
                            <Briefcase size={18} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Claim Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase block">Carrier & Claim #</label>
                                <div className="text-white font-bold text-lg truncate" title={job.insurance.carrier}>
                                    {job.insurance.carrier || 'N/A'}
                                </div>
                                <div className="text-sm font-mono text-text-secondary">{job.insurance.claimNumber}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-text-muted uppercase block">Loss Date</label>
                                    <div className="text-white text-sm">
                                        {job.dates?.lossDate ? new Date(job.dates.lossDate.seconds * 1000).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-text-muted uppercase block">FNOL</label>
                                    <div className="text-white text-sm">
                                        {job.dates?.fnolReceivedDate ? new Date(job.dates.fnolReceivedDate.seconds * 1000).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Loss Description / Notes Card */}
                    <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col">
                        <div className="flex items-center gap-2 text-accent-electric mb-4">
                            <ShieldAlert size={18} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Loss Information</h3>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3">
                            <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Description</label>
                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-4">
                                {job.details.lossDescription || "No loss description provided."}
                            </p>
                        </div>
                    </div>

                    {/* 3. Team & Quick Actions */}
                    <div className={`glass p-5 rounded-2xl border ${!leadTech ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-white/5'} flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-accent-electric">
                                <Users size={18} />
                                <h3 className="text-xs font-black uppercase tracking-widest">Team</h3>
                            </div>
                            {!isEditingAssignments && isManagerOrAdmin && (
                                <button
                                    onClick={() => setIsEditingAssignments(true)}
                                    className="text-[10px] font-bold text-white/50 hover:text-white uppercase transition-colors"
                                >
                                    Edit Team
                                </button>
                            )}
                        </div>

                        {!isEditingAssignments ? (
                            <div className="flex-1 flex flex-col justify-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent-electric text-black flex items-center justify-center font-bold shadow-lg shadow-accent-electric/20">
                                        {leadTech?.displayName[0] || '?'}
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-muted uppercase font-bold">Lead Technician</div>
                                        <div className="text-white font-bold">{leadTech?.displayName || 'Unassigned'}</div>
                                    </div>
                                </div>
                                <div className="pl-14">
                                    <div className="text-xs text-text-muted uppercase font-bold">Supervisor</div>
                                    <div className="text-white/80 text-sm">{supervisor?.displayName || 'Not Assigned'}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-3 animate-in fade-in">
                                <label className="text-[10px] font-bold text-text-muted uppercase">Assign Lead Tech</label>
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
                                <div className="flex gap-2 mt-auto">
                                    <button onClick={handleSaveAssignments} disabled={saving} className="flex-1 bg-accent-electric text-black text-xs font-bold py-2 rounded-lg">
                                        {saving ? '...' : 'Save'}
                                    </button>
                                    <button onClick={() => setIsEditingAssignments(false)} className="px-3 bg-white/10 text-white text-xs font-bold rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Claim Analysis - Full Width */}
                {job.claimData ? (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-forwards">
                        <ClaimAnalysis data={job.claimData} />
                    </div>
                ) : (
                    <div className="glass p-10 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center opacity-50">
                        <BrainCircuit size={48} className="text-white/20 mb-4" />
                        <h3 className="text-lg font-bold text-white">No AI Analysis Data</h3>
                        <p className="text-text-muted max-w-md mt-2">
                            This job has not yet been processed by the AI engine or field data is missing.
                        </p>
                    </div>
                )}

            </div>
        </div >
    );
};
