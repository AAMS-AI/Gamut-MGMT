import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { type Job, type Department } from '../../../types';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--accent-electric)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px'
                    }}>
                        <Building2 size={14} /> Branch Operations Center
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Branch Hub
                    </h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Personnel</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>12 Online</div>
                </div>
            </header>

            {/* Top Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {[
                    { label: 'Total Claims', value: stats.total, icon: Briefcase, color: 'var(--accent-electric)' },
                    { label: 'New FNOLs', value: stats.fnol, icon: Clock, color: 'var(--status-fnol)' },
                    { label: 'In Production', value: stats.active, icon: TrendingUp, color: 'var(--accent-primary)' },
                    { label: 'Recent Closeouts', value: stats.completed, icon: CheckCircle2, color: 'var(--status-closeout)' },
                ].map((stat, i) => (
                    <div key={i} className="glass" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                            <stat.icon size={80} />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <stat.icon size={14} /> {stat.label}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Department Grids - This is where the GM sees their "Departments" */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ListTree size={20} className="text-accent" /> Department Distribution
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {depts.map(dept => {
                            const deptJobs = jobs.filter(j => j.departmentId === dept.id);
                            return (
                                <div key={dept.id} className="glass" style={{ padding: '20px', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{dept.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        {deptJobs.length} Active Claims
                                    </div>
                                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(deptJobs.length / (stats.total || 1)) * 100}%`,
                                            height: '100%',
                                            backgroundColor: 'var(--accent-electric)',
                                            boxShadow: '0 0 10px var(--accent-electric)'
                                        }} />
                                    </div>
                                    <Link to={`/jobs?dept=${dept.id}`} style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-electric)',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        Manage Queue <ArrowRight size={12} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Office Pulse */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="var(--accent-primary)" /> Office Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Location</div>
                                <div style={{ fontSize: '0.875rem' }}>{activeOffice?.name || 'Unknown Office'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Office Manager</div>
                                <div style={{ fontSize: '0.875rem' }}>View Personnel List</div>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                                <Link to="/org" style={{
                                    display: 'block',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    Office Settings
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Performance</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>
                            Branch metrics will appear here as more data is collected.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
