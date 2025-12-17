import React from 'react';
import TeamsManagement from '../components/TeamsManagement';

export default function TeamsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-100">All Teams</h1>
                <p className="text-gray-500 mt-1">Manage all organization teams</p>
            </div>
            <TeamsManagement />
        </div>
    );
}
