import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { type Department } from '@/types/org';
import { type Job } from '@/types/jobs';
import {
    Briefcase,
    Clock,
    TrendingUp,
    CheckCircle2,
    MapPin,
    ArrowRight,
    Building2,
    ListTree
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BranchHub: React.FC = () => {
    const { profile } = useAuth();
    const { activeOfficeId, offices } = useOrganization();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [depts, setDepts] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const activeOffice = offices.find(o => o.id === activeOfficeId);
    const targetOfficeId = activeOfficeId || profile?.officeId;

    useEffect(() => {
        if (!targetOfficeId) return;

        // Fetch Office Jobs
        const qJobs = query(
            collection(db, 'jobs'),
            where('orgId', '==', profile?.orgId),
            where('officeId', '==', targetOfficeId)
        );
        const unsubJobs = onSnapshot(qJobs, (snap) => {
            setJobs(snap.docs.map(doc => doc.data() as Job));
        });

        // Fetch Office Departments
        const qDepts = query(
            collection(db, 'departments'),
            where('officeId', '==', targetOfficeId)
        );
        const unsubDepts = onSnapshot(qDepts, (snap) => {
            setDepts(snap.docs.map(doc => doc.data() as Department));
            setLoading(false);
        });

        return () => {
            unsubJobs();
            unsubDepts();
        };
    }, [profile?.orgId, targetOfficeId]);

    const stats = {
        total: jobs.length,
        fnol: jobs.filter(j => j.status === 'FNOL').length,
        active: jobs.filter(j => j.status === 'MITIGATION' || j.status === 'RECONSTRUCTION').length,
        completed: jobs.filter(j => j.status === 'CLOSEOUT').length
    };

    if (loading) return null;

    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-accent-electric text-xs font-bold uppercase tracking-widest mb-2">
                        <Building2 size={14} /> Branch Operations Center
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter m-0">
                        Branch Hub
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-text-muted text-sm">Active Personnel</div>
                    <div className="text-xl font-semibold text-white">12 Online</div>
                </div>
            </header>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in">
                {[
                    { label: 'Total Claims', value: stats.total, icon: Briefcase, color: 'var(--accent-electric)', glow: 'rgba(0, 242, 255, 0.2)' },
                    { label: 'New FNOLs', value: stats.fnol, icon: Clock, color: 'var(--status-fnol)', glow: 'rgba(59, 130, 246, 0.2)' },
                    { label: 'In Production', value: stats.active, icon: TrendingUp, color: 'var(--accent-primary)', glow: 'rgba(99, 102, 241, 0.2)' },
                    { label: 'Recent Closeouts', value: stats.completed, icon: CheckCircle2, color: 'var(--status-closeout)', glow: 'rgba(168, 85, 247, 0.2)' },
                ].map((stat, i) => (
                    <div key={i} className="glass-premium p-6 group hover-glow transition-all duration-500 overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-125 group-hover:rotate-12" style={{ color: stat.color }}>
                            <stat.icon size={100} />
                        </div>
                        <div className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <stat.icon size={12} style={{ color: stat.color }} /> {stat.label}
                        </div>
                        <div className="text-4xl font-black tracking-tighter" style={{ color: stat.color, filter: `drop-shadow(0 0 10px ${stat.glow})` }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 animate-in" style={{ animationDelay: '0.1s' }}>
                {/* Department Grids */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 m-0 text-text-secondary">
                            <ListTree size={16} className="text-accent-primary" /> Department Pulse
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {depts.map(dept => {
                            const deptJobs = jobs.filter(j => j.departmentId === dept.id);
                            const percentage = (deptJobs.length / (stats.total || 1)) * 100;
                            return (
                                <div key={dept.id} className="glass p-6 border border-white/5 hover:border-accent-electric/20 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-bold text-white tracking-tight">{dept.name}</div>
                                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
                                                {deptJobs.length} Operations
                                            </div>
                                        </div>
                                        <div className="text-xl font-black text-accent-electric/40 group-hover:text-accent-electric transition-colors">
                                            {Math.round(percentage)}%
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden ring-1 ring-white/5">
                                        <div className="h-full bg-linear-to-r from-accent-primary to-accent-electric shadow-[0_0_12px_rgba(0,242,255,0.4)] transition-all duration-1000 ease-out" style={{
                                            width: `${percentage}%`,
                                        }} />
                                    </div>
                                    <Link to={`/jobs?dept=${dept.id}`} className="text-[10px] text-accent-electric font-black flex items-center gap-2 hover:translate-x-1 transition-transform uppercase tracking-[0.1em] no-underline">
                                        ACCESS QUEUE <ArrowRight size={12} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Office Pulse */}
                <div className="flex flex-col gap-6">
                    <div className="glass p-6 border border-white/5">
                        <h3 className="text-base font-semibold mb-5 flex items-center gap-2 m-0 text-white">
                            <MapPin size={18} className="text-accent-primary" /> Office Information
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <div className="text-[0.7rem] text-text-muted uppercase tracking-wider font-bold mb-1">Location</div>
                                <div className="text-sm font-medium">{activeOffice?.name || 'Unknown Office'}</div>
                            </div>
                            <div>
                                <div className="text-[0.7rem] text-text-muted uppercase tracking-wider font-bold mb-1">Office Manager</div>
                                <div className="text-sm font-medium">View Personnel List</div>
                            </div>
                            <div className="mt-2">
                                <Link to="/org" className="block p-3 bg-white/5 hover:bg-white/10 rounded-xl text-center text-sm font-semibold text-white transition-colors border border-white/10 no-underline">
                                    Office Settings
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6">
                        <h3 className="text-base font-semibold mb-4 m-0 text-white">Performance</h3>
                        <div className="text-text-muted text-sm text-center py-5">
                            Branch metrics will appear here as more data is collected.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
