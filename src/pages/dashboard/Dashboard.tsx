import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Job } from '@/types/jobs';
import { type Office } from '@/types/org';
import { jobService } from '@/pages/jobs/jobService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HubPulse } from './components/HubPulse';

export const Dashboard: React.FC = () => {
    const { profile } = useAuth();
    const navigate = useNavigate(); // Hook for navigation
    const [jobs, setJobs] = useState<Job[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ((profile?.role === 'MEMBER' || profile?.role === 'DEPT_MANAGER' || profile?.role === 'OFFICE_ADMIN') && profile.officeId) {
            navigate(`/office/${profile.officeId}/dashboard`, { replace: true });
        }
    }, [profile, navigate]);

    useEffect(() => {
        if (!profile?.orgId) return;

        // Fetch All Jobs Org-wide using jobService
        const unsubJobs = jobService.subscribeToOrganizationJobs(profile.orgId, (jobsList: Job[]) => {
            setJobs(jobsList);
        });

        // Fetch All Offices
        const unsubOffices = onSnapshot(collection(db, 'offices'), (snap) => {
            setOffices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Office)));
            setLoading(false);
        });

        return () => {
            unsubJobs();
            unsubOffices();
        };
    }, [profile?.orgId]);

    const stats = {
        total: jobs.length,
        offices: offices.length,
        active: jobs.filter(j => j.status !== 'CLOSEOUT').length,
        revenue: '$1.2M' // Placeholder
    };

    if (loading) return null;

    const entities = offices.map(office => {
        const officeJobs = jobs.filter(j => j.officeId === office.id);
        const officeActive = officeJobs.filter(j => j.status !== 'CLOSEOUT').length;

        return {
            id: office.id,
            name: office.name,
            subtext: office.address,
            activeCount: officeActive,
            link: `/org?office=${office.id}`,
            personnelCount: '--'
        };
    });

    const hubStats = {
        total: stats.total,
        active: stats.active,
        entitiesCount: stats.offices,
        revenue: stats.revenue
    };

    if (loading) return null;

    return (
        <HubPulse
            title="Executive Overview"
            subtitle="Enterprise Command Center"
            stats={hubStats}
            entities={entities}
            entityType="OFFICE"
        />
    );
};
