import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import {
    Users,
    Briefcase,
    CheckSquare,
    MessageSquare,
    ArrowRight,
    Trello
} from 'lucide-react';

import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { hasPermission } from '../../../hooks/useRBAC';
import { type Job, type UserProfile } from '../../../types';

export const TeamOps: React.FC = () => {
    const { profile } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.departmentId && !hasPermission(profile, 'VIEW_FULL_TEAM_OPS')) return;

        // Members only see their own assigned jobs if restricted
        let q = query(
            collection(db, 'jobs'),
            where('orgId', '==', profile?.orgId),
            where('departmentId', '==', profile?.departmentId)
        );

        if (!hasPermission(profile, 'VIEW_FULL_TEAM_OPS')) {
            q = query(
                collection(db, 'jobs'),
                where('orgId', '==', profile?.orgId),
                where('assignedUserIds', 'array-contains', profile?.uid)
            );
        }

        const unsubscribe = onSnapshot(q, (snap) => {
            setJobs(snap.docs.map(doc => doc.data() as Job));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile]);

    // Fetch Manager Info
    const { activeDepartment } = useOrganization();
    const [manager, setManager] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!activeDepartment?.managerId) return;
        const unsub = onSnapshot(doc(db, 'users', activeDepartment.managerId), (snap) => {
            if (snap.exists()) setManager(snap.data() as UserProfile);
        });
        return () => unsub();
    }, [activeDepartment]);

    if (loading) return null;

    const stages = [
        { label: 'New / FNOL', status: 'FNOL', color: 'var(--status-fnol)' },
        { label: 'In Production', status: 'MITIGATION', color: 'var(--accent-primary)' },
        { label: 'Verification', status: 'RECONSTRUCTION', color: 'var(--accent-electric)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <div style={{ color: 'var(--accent-electric)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trello size={14} /> {hasPermission(profile, 'VIEW_FULL_TEAM_OPS') ? 'Tactical Operations' : 'My Assignments'}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                    {hasPermission(profile, 'VIEW_FULL_TEAM_OPS') ? 'Department Queue' : 'Active Work Orders'}
                </h1>
            </header>

            {!hasPermission(profile, 'VIEW_FULL_TEAM_OPS') && manager && (
                <div style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(0, 242, 255, 0.05))',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1.25rem'
                    }}>
                        {manager.displayName?.[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-electric)', fontWeight: 700, marginBottom: '4px' }}>
                            Your Department Manager
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{manager.displayName}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{manager.email}</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {stages.map(stage => {
                    const count = jobs.filter(j => j.status === stage.status).length;
                    return (
                        <div key={stage.status} className="glass" style={{ padding: '24px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>{stage.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stage.color }}>{count}</div>
                        </div>
                    );
                })}
            </div>

            <div className="glass" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Pending Action Items</h3>
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    {hasPermission(profile, 'VIEW_FULL_TEAM_OPS') ?
                        'No critical bottlenecks detected in the current queue.' :
                        'You have no pending action items for your assigned jobs.'}
                </div>
            </div>
        </div>
    );
};
