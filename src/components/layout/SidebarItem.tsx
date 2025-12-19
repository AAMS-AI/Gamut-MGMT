import React from 'react';
import { Link } from 'react-router-dom';

export interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    active?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 no-underline ${active
            ? 'text-accent-electric bg-[rgba(0,242,255,0.05)]'
            : 'text-text-secondary hover:bg-[rgba(255,255,255,0.03)] hover:text-white'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
        {active && (
            <div className="ml-auto w-1 h-1 rounded-full bg-accent-electric shadow-[0_0_10px_var(--accent-electric)]" />
        )}
    </Link>
);
