import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
    Users,
    Briefcase,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';
import { useParams } from 'react-router-dom';

import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { type Job } from '@/types';

// --- Types ---
type LaneId = 'unassigned' | 'in_progress' | 'review' | 'done';

interface Lane {
    id: LaneId;
    title: string;
    colors: string;
}

// --- Components ---

const KanbanCard = ({ job, isOverlay = false }: { job: Job; isOverlay?: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id, data: { type: 'Job', job } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        touchAction: 'none' as const // Essential for dnd-kit on mobile/touch
    };

    const daysInStage = Math.floor((new Date().getTime() - job.updatedAt?.toMillis()) / (1000 * 3600 * 24)) || 0;
    const isStagnant = daysInStage > 5 && job.status !== 'CLOSEOUT';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="glass hover:bg-white/5 transition-colors"
        >
            <div
                className={`p-4 rounded-xl transition-all duration-300 border-l-[4px] ${isOverlay ? 'bg-[#1a1a20] shadow-2xl scale-105 cursor-grabbing' : 'bg-transparent cursor-grab'} ${isStagnant ? 'border-red-500 shadow-[inset_4px_0_10px_rgba(239,68,68,0.1)]' : 'border-transparent'}`}
            >
                <div className="flex justify-between mb-3">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} /> {job.insurance.carrier}
                    </div>
                    {isStagnant && (
                        <div className="text-xs flex items-center gap-1 text-[#ef4444]">
                            <AlertCircle size={12} /> {daysInStage}d
                        </div>
                    )}
                </div>

                <div className="text-base font-semibold mb-1 text-white">
                    {job.customer.name}
                </div>
                <div className="text-[0.8125rem] text-text-muted flex items-center gap-1 mb-4">
                    {job.property.address}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <div className="flex items-center -space-x-2">
                        {job.assignedUserIds && job.assignedUserIds.length > 0 ? (
                            job.assignedUserIds.map((uid) => (
                                <div key={uid} className="w-6 h-6 rounded-full border-2 border-bg-primary" style={{
                                    backgroundColor: `hsl(${parseInt(uid.slice(-4), 16) % 360}, 70%, 50%)`,
                                }} />
                            ))
                        ) : (
                            <div className="w-6 h-6 rounded-full border border-dashed border-text-muted flex items-center justify-center text-[10px] text-text-muted">?</div>
                        )}
                    </div>
                    <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-text-secondary">
                        {job.status}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ lane, jobs }: { lane: Lane; jobs: Job[] }) => {
    const { setNodeRef } = useSortable({ id: lane.id, data: { type: 'Lane', lane } });

    return (
        <div ref={setNodeRef} className="flex flex-col min-w-[320px] h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.colors }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white m-0">
                        {lane.title}
                    </h3>
                    <span className="text-xs text-text-muted font-medium">
                        {jobs.length}
                    </span>
                </div>
                <MoreHorizontal size={16} className="text-text-muted cursor-pointer hover:text-white" />
            </div>

            <div className="flex-1 bg-white/5 rounded-2xl p-3 flex flex-col gap-3">
                <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    {jobs.map(job => (
                        <KanbanCard key={job.id} job={job} />
                    ))}
                    {jobs.length === 0 && (
                        <div className="h-24 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-text-muted text-sm">
                            Drop Items Here
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export const OperationsBoard: React.FC = () => {
    const { profile } = useAuth();
    const { officeId } = useParams(); // URL Driven Context
    const { offices, activeDepartmentId, activeDepartment } = useOrganization(); // Fetch offices list
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activeDragItem, setActiveDragItem] = useState<Job | null>(null);

    // Derive active office from URL params
    const activeOffice = officeId ? offices.find(o => o.id === officeId) : null;

    // --- Data Fetching ---
    useEffect(() => {
        if (!profile || !officeId) return;

        let q = query(
            collection(db, 'jobs'),
            where('orgId', '==', profile.orgId),
            where('officeId', '==', officeId)
        );

        if (activeDepartmentId) {
            q = query(q, where('departmentId', '==', activeDepartmentId));
        }

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data().updatedAt || { toMillis: () => Date.now() }
            })) as Job[];
            setJobs(list);
        });
        return () => unsub();
    }, [profile, officeId, activeDepartmentId]);

    // --- Lane Logic ---
    const lanes: Lane[] = [
        { id: 'unassigned', title: 'Unassigned / New', colors: 'var(--status-fnol)' },
        { id: 'in_progress', title: 'Field Operations', colors: 'var(--status-mitigation)' },
        { id: 'review', title: 'Manager Review', colors: '#eab308' }, // Yellow
        { id: 'done', title: 'Ready for Billing', colors: 'var(--status-reconstruction)' },
    ];

    const getLaneId = (job: Job): LaneId => {
        if (job.status === 'CLOSEOUT') return 'done';
        if (job.status === 'REVIEW') return 'review';
        if (job.assignedUserIds?.length > 0 && (job.status === 'MITIGATION' || job.status === 'RECONSTRUCTION')) return 'in_progress';
        return 'unassigned';
    };

    const groupedJobs = useMemo(() => {
        const groups: Record<LaneId, Job[]> = { unassigned: [], in_progress: [], review: [], done: [] };
        jobs.forEach(job => {
            const lane = getLaneId(job);
            groups[lane].push(job);
        });
        return groups;
    }, [jobs]);

    // --- DnD Handlers ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const job = jobs.find(j => j.id === active.id);
        if (job) setActiveDragItem(job);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        let targetLaneId: LaneId | null = null;

        if (lanes.some(l => l.id === over.id)) {
            targetLaneId = over.id as LaneId;
        } else {
            const overJob = jobs.find(j => j.id === over.id);
            if (overJob) {
                targetLaneId = getLaneId(overJob);
            }
        }

        if (targetLaneId) {
            const draggedJob = jobs.find(j => j.id === active.id);
            if (!draggedJob) return;

            const currentLaneId = getLaneId(draggedJob);
            if (currentLaneId !== targetLaneId) {
                const updates: Partial<Job> = { updatedAt: serverTimestamp() };

                if (targetLaneId === 'unassigned') {
                    updates.assignedUserIds = [];
                } else if (targetLaneId === 'in_progress') {
                    if (draggedJob.status !== 'MITIGATION' && draggedJob.status !== 'RECONSTRUCTION') {
                        updates.status = 'MITIGATION';
                    }
                    if ((draggedJob.assignedUserIds?.length || 0) === 0) {
                        updates.assignedUserIds = [profile?.uid || 'placeholder'];
                    }
                } else if (targetLaneId === 'review') {
                    updates.status = 'REVIEW';
                } else if (targetLaneId === 'done') {
                    updates.status = 'CLOSEOUT';
                }

                try {
                    await updateDoc(doc(db, 'jobs', draggedJob.id), updates);
                } catch (e) {
                    console.error("Failed to update status", e);
                }
            }
        }
    };

    // Disable DnD for Read-Only Members
    const isReadOnly = profile?.role === 'MEMBER';

    if (isReadOnly) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)]">
                <header className="mb-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 text-accent-electric text-xs font-bold uppercase mb-2">
                                <Users size={14} /> {activeDepartment ? `${activeOffice?.name} - ${activeDepartment.name}` : (activeOffice?.name || 'Operations Board')}
                            </div>
                            <h1 className="text-3xl font-extrabold m-0">Active Claims</h1>
                        </div>
                        <div className="flex gap-4">
                            {/* Read Only Badge */}
                            <div className="px-4 py-2 rounded-lg bg-white/5 text-sm text-text-secondary">
                                Read Only
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-white/5 text-sm text-text-secondary">
                                Active Claims: <strong className="text-white">{jobs.length}</strong>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    {lanes.map(lane => (
                        <div key={lane.id} className="flex flex-col min-w-[320px] h-full">
                            <div className="mb-4 flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.colors }} />
                                    <h3 className="text-sm font-bold uppercase text-white m-0">{lane.title}</h3>
                                    <span className="text-xs text-text-muted font-medium">{groupedJobs[lane.id].length}</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl p-3 flex flex-col gap-3">
                                {groupedJobs[lane.id].map(job => (
                                    <KanbanCard key={job.id} job={job} />
                                ))}
                                {groupedJobs[lane.id].length === 0 && (
                                    <div className="h-24 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-text-muted text-sm">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-[calc(100vh-140px)]">
                <header className="mb-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 text-accent-electric text-xs font-bold uppercase mb-2">
                                <Users size={14} /> {activeDepartment ? `${activeOffice?.name} - ${activeDepartment.name}` : (activeOffice?.name || 'Operations Board')}
                            </div>
                            <h1 className="text-3xl font-extrabold m-0">Active Claims</h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 rounded-lg bg-white/5 text-sm text-text-secondary">
                                Active Claims: <strong className="text-white">{jobs.length}</strong>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    {lanes.map(lane => (
                        <KanbanColumn
                            key={lane.id}
                            lane={lane}
                            jobs={groupedJobs[lane.id]}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeDragItem ? <KanbanCard job={activeDragItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};
