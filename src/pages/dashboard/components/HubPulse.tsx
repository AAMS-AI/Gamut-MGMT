import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    TrendingUp,
    Shield,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';

export interface HubPulseEntity {
    id: string;
    name: string;
    subtext: string;
    activeCount: number;
    link: string;
    personnelCount?: number | string;
}

export interface HubPulseStats {
    total: number;
    active: number;
    entitiesCount: number;
    revenue: string;
}

interface HubPulseProps {
    title: string;
    subtitle: string;
    stats: HubPulseStats;
    entities: HubPulseEntity[];
    entityType: 'OFFICE' | 'DEPARTMENT';
}

export const HubPulse: React.FC<HubPulseProps> = ({
    title,
    subtitle,
    stats,
    entities,
    entityType
}) => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-accent-primary text-xs font-bold uppercase tracking-widest mb-2">
                        <Shield size={14} /> {subtitle}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight m-0">
                        {title}
                    </h1>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    { label: 'Total Jobs Scope', value: stats.total, icon: Briefcase, color: 'var(--accent-electric)' },
                    { label: `Active ${entityType === 'OFFICE' ? 'Branches' : 'Departments'}`, value: stats.entitiesCount, icon: Building2, color: 'var(--accent-primary)' },
                    { label: 'Active Volume', value: stats.active, icon: TrendingUp, color: 'var(--status-mitigation)' },
                    { label: 'Estimated Revenue', value: stats.revenue, icon: LayoutDashboard, color: '#fff' },
                ].map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <h3 className="text-xl font-semibold flex items-center gap-2.5 m-0">
                <Building2 size={20} className="text-text-secondary" /> {entityType === 'OFFICE' ? 'Branch Performance' : 'Department Breakdown'}
            </h3>

            {/* Entity Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
                {entities.map(entity => (
                    <div key={entity.id} className="glass p-8 border border-white/5 hover:border-accent-electric/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-xl font-semibold mb-1 m-0 group-hover:text-accent-electric transition-colors">{entity.name}</h4>
                                <div className="text-sm text-text-muted">{entity.subtext}</div>
                            </div>
                            <div className="px-3 py-1 bg-[rgba(0,242,255,0.1)] text-accent-electric rounded-full text-xs font-semibold">
                                Active
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-xs text-text-muted mb-1">Active Claims</div>
                                <div className="text-xl font-bold">{entity.activeCount}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-xs text-text-muted mb-1">Personnel</div>
                                <div className="text-xl font-bold">{entity.personnelCount || '--'}</div>
                            </div>
                        </div>

                        <Link to={entity.link} className="flex items-center gap-2 text-accent-electric no-underline text-sm font-medium hover:opacity-80 transition-opacity">
                            Inspect {entityType === 'OFFICE' ? 'Branch' : 'Department'} <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
