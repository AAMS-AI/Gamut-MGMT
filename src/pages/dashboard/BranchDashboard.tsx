import React from 'react';
import { DailyPulse } from '@/pages/dashboard/components/DailyPulse';

export const BranchDashboard: React.FC = () => {
    // Uses officeId from URL implicitly via context or just renders Pulse for now

    return (
        <div className="flex flex-col gap-8">
            {/* Re-using DailyPulse for now as the "Hub Pulse" */}
            <DailyPulse />
        </div>
    );
};
