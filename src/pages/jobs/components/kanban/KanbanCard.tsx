import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Briefcase, AlertCircle } from 'lucide-react';
import { type Job } from '@/types/jobs';

interface KanbanCardProps {
    job: Job;
    isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ job, isOverlay = false }) => {
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
        touchAction: 'none' as const
    };

    const [now, setNow] = React.useState<number | null>(null);
    React.useEffect(() => {
        setNow(Date.now());
    }, []);

    const daysInStage = now
        ? Math.floor((now - (job.updatedAt?.toMillis() || now)) / (1000 * 3600 * 24))
        : 0;
    const isStagnant = daysInStage > 5 && job.status !== 'CLOSEOUT';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`glass-premium group transition-[transform,box-shadow,border-color] duration-300 ${isDragging ? 'z-50' : 'hover-glow'}`}
        >
            <div
                className={`p-5 rounded-2xl transition-[border-color,box-shadow] duration-300 border-l-[3px] ${isOverlay ? 'bg-white/10 shadow-2xl scale-105 cursor-grabbing' : 'bg-transparent cursor-grab'} ${isStagnant ? 'border-red-500 shadow-[inset_10px_0_20px_rgba(239,68,68,0.05)]' : 'border-transparent group-hover:border-accent-electric/30'}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-text-secondary transition-colors">
                        <Briefcase size={12} className="text-accent-primary" /> {job.insurance.carrier}
                    </div>
                    {isStagnant && (
                        <div className="text-[10px] font-black flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                            <AlertCircle size={10} strokeWidth={3} /> {daysInStage}D STALE
                        </div>
                    )}
                </div>

                <div className="text-sm font-bold mb-1 text-white tracking-tight group-hover:text-accent-electric transition-colors">
                    {job.customer.name}
                </div>
                <div className="text-[0.75rem] text-text-muted font-medium flex items-center gap-1.5 mb-5">
                    {job.property.address}
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div className="flex items-center -space-x-1.5">
                        {job.assignedUserIds && job.assignedUserIds.length > 0 ? (
                            job.assignedUserIds.map((uid) => (
                                <div key={uid} className="w-6 h-6 rounded-full border-2 border-bg-secondary ring-1 ring-white/5 shadow-lg overflow-hidden flex items-center justify-center text-[10px] font-black" style={{
                                    backgroundColor: `hsl(${parseInt(uid.slice(-4), 16) % 360}, 60%, 40%)`,
                                    color: 'white'
                                }}>
                                    {uid.slice(0, 1).toUpperCase()}
                                </div>
                            ))
                        ) : (
                            <div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[8px] text-text-muted font-bold">VAC</div>
                        )}
                    </div>
                    <div className="text-[9px] font-black px-2.5 py-1 rounded-md bg-white/5 text-text-secondary uppercase tracking-widest ring-1 ring-white/5">
                        {job.status}
                    </div>
                </div>
            </div>
        </div>
    );
};
