import React from 'react';
import { PulseExecutive, type HubPulseEntity } from './PulseExecutive';
import { PulseManager } from './PulseManager';
import { PulseMember } from './PulseMember';
import { calculateMetrics } from '@/utils/dashboardMetrics';
import { type Job, type Task } from '@/types/jobs';
import { type UserRole } from '@/types/team';

interface HubPulseContainerProps {
    role: UserRole;
    // Common Data
    jobs: Job[];
    tasks: Task[];
    // Executive Data (Optional/Context Dependent)
    entities?: HubPulseEntity[];
    entityType?: 'OFFICE' | 'DEPARTMENT';
    title?: string;
    subtitle?: string;
    username?: string;
}

export const HubPulseContainer: React.FC<HubPulseContainerProps> = ({
    role,
    jobs,
    tasks,
    title = "Hub Pulse",
    subtitle = "Overview",
    username = "User",
    // Legacy props (will be partly replaced by calculated metrics)
    entities = [],
    entityType = 'OFFICE'
}) => {
    // 1. Calculate Standard Metrics
    const metrics = calculateMetrics(jobs);

    return (
        <div className="min-h-screen bg-transparent text-text-primary p-4 md:p-8 font-sans selection:bg-accent-electric selection:text-black">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-text-muted text-sm font-medium tracking-wide uppercase mb-1">{subtitle}</h2>
                    <h1 className="text-4xl font-black text-white tracking-tight">{title}</h1>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-text-muted text-sm">Welcome back,</p>
                    <p className="text-xl font-bold text-accent-electric">{username}</p>
                </div>
            </div>

            {/* CONTENT SWITCHER */}
            {(role === 'OWNER' || role === 'ORG_ADMIN' || role === 'OFFICE_ADMIN') && (
                <PulseExecutive
                    stats={metrics}
                    entities={entities}
                    entityType={entityType}
                    jobs={jobs}
                    tasks={tasks}
                    showRevenue={true}
                    showEntityGrid={true}
                />
            )}

            {role === 'DEPT_MANAGER' && (
                <PulseManager
                    stats={metrics} // Pass calculated metrics
                    jobs={jobs}
                    tasks={tasks}
                />
            )}

            {role === 'MEMBER' && (
                <PulseMember
                    jobs={jobs}
                    tasks={tasks}
                    username={username}
                />
            )}

        </div>
    );
};
