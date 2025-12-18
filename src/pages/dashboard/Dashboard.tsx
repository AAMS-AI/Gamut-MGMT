import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { OwnerCommandCenter } from './components/OwnerCommandCenter';
import { BranchHub } from './components/BranchHub';
import { TeamOps } from './components/TeamOps';
import { DailyPulse } from './components/DailyPulse';

export const Dashboard: React.FC = () => {
    const { profile } = useAuth();
    const { activeOfficeId } = useOrganization();

    if (!profile) return null;

    // Owners and Admins can see either the Command Center (Global) or a specific Branch Hub
    if (profile.role === 'OWNER' || profile.role === 'ORG_ADMIN') {
        if (activeOfficeId) {
            return <BranchHub />;
        }
        return <OwnerCommandCenter />;
    }

    switch (profile.role) {
        case 'OFFICE_ADMIN':
            return <BranchHub />;
        case 'DEPT_MANAGER':
            return <TeamOps />;
        case 'MEMBER':
            return <DailyPulse />;
        default:
            return (
                <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-muted)' }}>Access Level Unrecognized</h2>
                    <p>Please contact your organization administrator.</p>
                </div>
            );
    }
};
