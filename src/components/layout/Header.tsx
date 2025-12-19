import React from 'react';
import { MapPin, Shield, PlusCircle } from 'lucide-react';
import { type Office, type Department } from '@/types/org';
import { type UserProfile } from '@/types/team';

interface HeaderProps {
    activeOfficeId: string | null;
    activeOffice: Office | undefined;
    activeDepartmentId: string | null;
    departments: Department[];
    profile: UserProfile | null;
    onJobCreateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    activeOfficeId,
    activeOffice,
    activeDepartmentId,
    departments,
    profile,
    onJobCreateClick
}) => {
    return (
        <header className="mb-10 flex justify-between items-center gap-6 animate-in">
            <div className="flex items-center gap-6">
                <div className="shrink-0">
                    <h2 className="text-3xl font-black tracking-tighter m-0 gradient-text uppercase">
                        {activeOfficeId ? (activeOffice?.name || 'Branch Hub') : 'Enterprise Command'}
                    </h2>
                </div>

                <div
                    className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-2xl transition-all duration-500 ${activeDepartmentId
                        ? 'bg-accent-electric/10 border-accent-electric/30 text-accent-electric shadow-[0_0_20px_rgba(0,242,255,0.15)] scale-105'
                        : 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                        }`}
                >
                    {activeOfficeId ? <MapPin size={12} strokeWidth={3} /> : <Shield size={12} strokeWidth={3} />}
                    {activeOfficeId
                        ? (activeDepartmentId
                            ? `${departments.find(d => d.id === activeDepartmentId)?.name || 'Department'} ACTIVE`
                            : 'Branch Pulse')
                        : 'Overseer Mode'}
                </div>
            </div>

            {activeOfficeId && profile?.role !== 'MEMBER' && (
                <button
                    onClick={onJobCreateClick}
                    className="glass-premium flex items-center gap-2 px-6 py-2.5 text-white border-none cursor-pointer hover-glow active:scale-95 group"
                >
                    <PlusCircle size={18} className="text-accent-electric group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-bold tracking-tighter text-sm">INITIATE JOB</span>
                </button>
            )}
        </header>
    );
};
