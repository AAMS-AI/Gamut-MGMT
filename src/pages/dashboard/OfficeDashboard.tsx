import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { jobService } from '@/pages/jobs/jobService';
import { type Job } from '@/types/jobs';
import { HubPulseContainer } from './components/HubPulseContainer';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type HubPulseEntity } from './components/PulseExecutive';

export const OfficeDashboard: React.FC = () => {
    const { officeId } = useParams();
    const { profile } = useAuth();
    const { departments, offices } = useOrganization();
    const navigate = useNavigate();

    // Explicitly find the active office for the title
    const activeOffice = offices.find(o => o.id === officeId);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.orgId || !officeId || !profile?.role) return;

        // --- STRICT ACCESS CONTROL (Per Spec) ---
        // DEPT MANAGER -> Redirect to their Department Dashboard (or Home)
        if (profile.role === 'DEPT_MANAGER') {
            // Ideally redirect to /office/id/department/id, but for safety lets go to Dashboard which will route them helpfully
            // Or explicit:
            navigate('/dashboard', { replace: true });
            return;
        }

        // MEMBER -> Redirect to Home (Workbench)
        if (profile.role === 'MEMBER') {
            navigate('/dashboard', { replace: true });
            return;
        }

        // OFFICE_ADMIN -> Check strict ownership
        if (profile.role === 'OFFICE_ADMIN' && profile.officeId !== officeId) {
            navigate('/dashboard', { replace: true }); // Deny access to other offices
            return;
        }

        // --- DATA FETCHING (Exec & GM Only) ---
        const unsubscribe = jobService.subscribeToOfficeJobs(
            profile.orgId,
            officeId,
            null,
            (list) => {
                setJobs(list);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [profile?.orgId, officeId, profile?.role, profile?.officeId, profile?.uid, navigate]);

    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        if (!profile?.uid) return;

        // Fetch tasks
        const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
            const userTasks = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter((t: any) => t.userId === profile.uid || t.assignedTo === profile.uid);
            setTasks(userTasks);
        });

        return () => unsub();
    }, [profile?.uid]);

    // Data Prep for Executive View
    const activeOfficeDepts = departments.filter(d => d.officeId === officeId);

    const entities: HubPulseEntity[] = activeOfficeDepts.map(dept => {
        const deptJobs = jobs.filter(j => j.departmentId === dept.id);
        const deptActive = deptJobs.filter(j => j.status !== 'CLOSEOUT').length;

        return {
            id: dept.id,
            name: dept.name,
            subtext: `${dept.name} Division`,
            activeCount: deptActive,
            link: `/office/${officeId}/department/${dept.id}`, // Route to Dept Dashboard
            personnelCount: '--'
        };
    });

    if (loading) return <div className="p-8 text-accent-electric animate-pulse">Loading Branch...</div>;

    const pageTitle = activeOffice?.name || "Branch Hub";
    const pageSubtitle = "Branch Command Center";

    return (
        <HubPulseContainer
            role={profile?.role || 'MEMBER'}
            jobs={jobs}
            tasks={tasks}
            title={pageTitle}
            subtitle={pageSubtitle}
            username={profile?.displayName || 'User'}
            entities={entities}
            entityType="DEPARTMENT"
        />
    );
};
