import React, { useState, type ReactNode, useEffect } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Building2,
    Network,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams } from 'react-router-dom';
import { JobCreate } from '@/pages/jobs/JobCreate';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { profile, signOut } = useAuth();
    const { organization, offices, departments, activeOfficeId, activeDepartmentId, setActiveOfficeId, setActiveDepartmentId } = useOrganization();
    const params = useParams();
    const [showJobModal, setShowJobModal] = useState(false);

    // Sync URL with Context
    const urlOfficeId = params.officeId || null;

    useEffect(() => {
        if (urlOfficeId) {
            setActiveOfficeId(urlOfficeId);
        } else {
            setActiveOfficeId(null);
        }
    }, [urlOfficeId, setActiveOfficeId]);

    const effectiveOfficeId = urlOfficeId;
    const activeOffice = offices.find(o => o.id === effectiveOfficeId);

    // --- Dynamic Navigation ---
    // --- Dynamic Navigation ---
    let navItems;

    if (effectiveOfficeId) {
        // Unified Navigation for All Roles (GM, Manager, Member)
        // Access control is handled by the pages themselves or the data filtering
        navItems = [
            { icon: LayoutDashboard, label: 'Hub Pulse', to: `/office/${effectiveOfficeId}/dashboard` },
            { icon: Briefcase, label: 'Claims', to: `/office/${effectiveOfficeId}/jobs` },
            { icon: ClipboardList, label: 'Kanban Board', to: `/office/${effectiveOfficeId}/ops` },
        ];

        // "Departments" is for Admins/GMs only (Configuration)
        if (profile?.role !== 'MEMBER' && profile?.role !== 'DEPT_MANAGER') {
            navItems.push({ icon: Network, label: 'Departments', to: `/office/${effectiveOfficeId}/depts` });
        }

        // Everyone sees Roster
        navItems.push({ icon: Users, label: 'Staff Roster', to: `/office/${effectiveOfficeId}/team` });
    } else {
        if (profile?.role === 'MEMBER') {
            // Member in global context - likely will be redirected, but show minimal interface for now
            navItems = [
                { icon: Briefcase, label: 'My Claims', to: '/jobs' },
            ];
        } else {
            navItems = [
                { icon: LayoutDashboard, label: 'Hub Pulse', to: '/' },
                { icon: Briefcase, label: 'Claims', to: '/jobs' },
                { icon: ClipboardList, label: 'Kanban Board', to: '/ops' },
                { icon: Building2, label: 'Branches', to: '/org' },
                { icon: Users, label: 'Staff Roster', to: '/users' },
            ];
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white font-sans mesh-gradient relative overflow-hidden">
            {/* Background Glows */}
            <div className="glow-blob top-[-10%] left-[-10%] opacity-20" />
            <div className="glow-blob bottom-[-10%] right-[-10%] opacity-10" />

            <Sidebar
                profile={profile}
                organization={organization}
                offices={offices}
                departments={departments}
                activeOfficeId={activeOfficeId}
                activeDepartmentId={activeDepartmentId}
                setActiveDepartmentId={setActiveDepartmentId}
                signOut={signOut}
                navItems={navItems}
            />

            {/* Main Content */}
            <main className="ms-72 flex-1 p-8 min-h-screen relative z-10 animate-in">
                <Header
                    activeOfficeId={activeOfficeId}
                    activeOffice={activeOffice}
                    activeDepartmentId={activeDepartmentId}
                    departments={departments}
                    profile={profile}
                    onJobCreateClick={() => setShowJobModal(true)}
                />

                {children}

                {showJobModal && <JobCreate onClose={() => setShowJobModal(false)} />}
            </main>
        </div>
    );
};
