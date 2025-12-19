import React from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { type Job } from '@/types/jobs';
import { KanbanCard } from '@/pages/jobs/components/kanban/KanbanCard';

export type LaneId = 'unassigned' | 'in_progress' | 'review' | 'done';

export interface Lane {
    id: LaneId;
    title: string;
    colors: string;
}

interface KanbanColumnProps {
    lane: Lane;
    jobs: Job[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ lane, jobs }) => {
    const { setNodeRef } = useSortable({ id: lane.id, data: { type: 'Lane', lane } });

    return (
        <div ref={setNodeRef} className="flex flex-col min-w-[320px] h-full">
            <div className="flex items-center justify-between mb-5 px-3">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: lane.colors, color: lane.colors }} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary m-0">
                        {lane.title}
                    </h3>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-text-muted font-bold">
                        {jobs.length}
                    </span>
                </div>
                <MoreHorizontal size={14} className="text-text-muted cursor-pointer hover:text-white transition-colors" />
            </div>

            <div className="flex-1 bg-white/[0.02] backdrop-blur-md rounded-2xl p-3 flex flex-col gap-3 min-h-[500px] border border-white/[0.03]">
                <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    {jobs.map(job => (
                        <KanbanCard key={job.id} job={job} />
                    ))}
                    {jobs.length === 0 && (
                        <div className="flex-1 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-text-muted text-xs gap-2 py-10">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <PlusCircle size={14} />
                            </div>
                            <span>Awaiting Claims</span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};
