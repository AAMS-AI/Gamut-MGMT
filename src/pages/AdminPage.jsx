import React, { useState } from 'react';
import { Users, Briefcase, Building2 } from 'lucide-react';
import AdminUserManagement from '../components/AdminUserManagement';
import TeamsManagement from '../components/TeamsManagement';
import OrganizationPage from './OrganizationPage';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'teams', label: 'Teams', icon: Briefcase },
        { id: 'organization', label: 'Organization', icon: Building2 },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Admin Portal</h1>
                    <p className="text-gray-500 mt-1">Manage users, teams, and organization settings</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                }
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'users' && <AdminUserManagement />}
                {activeTab === 'teams' && <TeamsManagement />}
                {activeTab === 'organization' && <OrganizationPage />}
            </div>
        </div>
    );
}
