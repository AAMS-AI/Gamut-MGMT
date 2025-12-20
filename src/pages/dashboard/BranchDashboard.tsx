import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { jobService } from '@/pages/jobs/jobService';
import { type Job } from '@/types/jobs';
import { HubPulse } from './components/HubPulse';

export const BranchDashboard: React.FC = () => {
    const { officeId } = useParams();
    const { profile } = useAuth();
    const { departments, offices } = useOrganization();

    // Explicitly find the active office for the title
    const activeOffice = offices.find(o => o.id === officeId);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.orgId || !officeId) return;

        // Subscribe to ALL jobs in this office
        const unsubscribe = jobService.subscribeToOfficeJobs(
            profile.orgId,
            officeId,
            null, // Get ALL deps
            (list) => {
                setJobs(list);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [profile?.orgId, officeId]);

    const activeOfficeDepts = departments.filter(d => d.officeId === officeId);

    // Calculate Stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status !== 'CLOSEOUT').length;

    // Map Departments as Entities
    const entities = activeOfficeDepts.map(dept => {
        const deptJobs = jobs.filter(j => j.departmentId === dept.id);
        const deptActive = deptJobs.filter(j => j.status !== 'CLOSEOUT').length;

        return {
            id: dept.id,
            name: dept.name,
            subtext: `${dept.name} Division`, // Or some other subtitle
            activeCount: deptActive,
            link: `/office/${officeId}/jobs?dept=${dept.id}`, // Or simply link to the filtered view
            personnelCount: '--'
        };
    });

    const hubStats = {
        total: totalJobs,
        active: activeJobs,
        entitiesCount: activeOfficeDepts.length,
        revenue: '$--'
    };

    if (loading) return <div className="p-8 text-accent-electric animate-pulse">Loading Hub Pulse...</div>;

    return (
        <HubPulse
            title={activeOffice?.name || "Branch Hub"}
            subtitle="Branch Command Center"
            stats={hubStats}
            entities={entities}
            entityType="DEPARTMENT"
        />
    );
};
