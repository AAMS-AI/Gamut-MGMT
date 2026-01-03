
import React from 'react';
import { type Job } from '@/types/jobs';
import {
    Users,
    MapPin,
    Activity,
    AlertCircle
} from 'lucide-react';

interface JobOverviewTabProps {
    job: Job;
    leadTech?: { displayName: string; photoURL?: string };
    supervisor?: { displayName: string; photoURL?: string };
}

export const JobOverviewTab: React.FC<JobOverviewTabProps> = ({ job, leadTech, supervisor }) => {

    // Mock Activity Feed based on Job Data
    // In a real app, this would query a 'timeline' or 'audit_logs' collection
    const activities = [
        { type: 'created', label: 'Job Created', date: job.createdAt, user: 'System' },
        ...(job.phases?.filter(p => p.status === 'COMPLETED').map(p => ({
            type: 'phase_complete',
            label: `Phase Completed: ${p.name} `,
            date: p.completedAt,
            user: 'Team'
        })) || [])
    ].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

    // Fallback if no activity
    if (activities.length === 0) {
        activities.push({ type: 'info', label: 'No recent activity', date: null, user: '-' });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">

            {/* CARD 1: MAP (Top Left - 2 cols) */}
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2 rounded-3xl border border-white/5 flex flex-col relative group overflow-hidden shadow-2xl min-h-[320px]">
                <div className="absolute inset-0 bg-[#151515] z-0">
                    <div className="absolute inset-0 opacity-30"
                        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '15px 15px' }}>
                    </div>
                </div>
                {/* Central Pin */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="relative">
                        <MapPin size={48} className="text-accent-primary drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)] fill-black/50" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/50 blur-sm rounded-full"></div>
                    </div>
                </div>
                {/* Address Banner */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black text-white leading-tight">{job.property.address}</h2>
                            <div className="text-text-muted font-medium mt-1 text-xs uppercase">
                                {job.property.city}, {job.property.state} {job.property.zip}
                            </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg text-white">
                            <MapPin size={20} />
                        </div>
                    </div>
                </div>
            </div>


            {/* CARD 2: ACTIVITY FEED (Top Right - 2 cols) */}
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 row-span-2 rounded-3xl bg-[#111] border border-white/5 relative overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-accent-electric" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Activity</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                    {/* Activity Items */}
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5"></div>

                        {activities.map((act, i) => (
                            <div key={i} className="relative pl-16 pr-6 py-4 hover:bg-white/5 transition-colors group">
                                {/* Dot */}
                                <div className="absolute left-[29px] top-6 w-1.5 h-1.5 rounded-full bg-white/20 border border-[#111] ring-4 ring-[#111] group-hover:bg-accent-electric transition-colors z-10"></div>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-white mb-0.5">{act.label}</p>
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span className="flex items-center gap-1"><Users size={10} /> {act.user}</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono text-text-muted opacity-50 whitespace-nowrap">
                                        {act.date ? new Date(act.date.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Filler items if empty */}
                        {activities.length < 3 && (
                            <div className="p-8 text-center text-text-muted text-xs italic opacity-50">
                                End of timeline.
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* CARD 3: CRITICAL NOTES / ACTION ITEMS (Bottom Left - 1 col) */}
            <div className="xl:col-span-2 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between text-accent-secondary mb-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">Critical Notes</h3>
                    </div>
                    <button className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors">+ Add</button>
                </div>

                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-text-secondary italic">
                    {job.details.notes ? (
                        <span className="not-italic text-white">{job.details.notes}</span>
                    ) : "No critical notes pinned."}
                </div>
            </div>


            {/* CARD 4: TEAM ROSTER (Bottom Right - 2 cols) */}
            <div className="xl:col-span-2 rounded-3xl bg-[#111] border border-white/5 p-6 flex flex-col hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 text-text-muted mb-6">
                    <Users size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Assigned Team</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Supervisor */}
                    <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm border border-white/10 overflow-hidden shrink-0">
                            {supervisor?.photoURL ?
                                <img src={supervisor.photoURL} alt="Sup" className="w-full h-full object-cover" /> :
                                (supervisor?.displayName?.[0] || '?')
                            }
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[10px] font-bold text-text-muted uppercase truncate">Supervisor</div>
                            <div className="text-sm font-bold text-white truncate">{supervisor?.displayName || 'Unassigned'}</div>
                        </div>
                    </div>

                    {/* Lead Tech */}
                    <div className="bg-accent-electric/5 p-3 rounded-xl flex items-center gap-3 border border-accent-electric/10">
                        <div className="w-10 h-10 rounded-full bg-accent-electric text-black flex items-center justify-center font-bold text-sm shadow-lg shadow-accent-electric/20 overflow-hidden shrink-0">
                            {leadTech?.photoURL ?
                                <img src={leadTech.photoURL} alt="Tech" className="w-full h-full object-cover" /> :
                                (leadTech?.displayName?.[0] || '?')
                            }
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[10px] font-bold text-accent-electric uppercase truncate">Lead Tech</div>
                            <div className="text-sm font-bold text-white truncate">{leadTech?.displayName || 'Unassigned'}</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
