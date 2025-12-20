import React from 'react';
import { MapPin, Shield, PlusCircle, Search, Bell } from 'lucide-react';
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

            {/* Global Search */}
            <div className="flex-1 max-w-xl mx-auto px-6 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-electric transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search jobs, claims, addresses..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-electric/50 focus:bg-white/10 transition-all placeholder:text-text-muted/50 font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-text-muted">⌘</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-text-muted">K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer border border-transparent hover:border-white/10">
                    <Bell size={18} />
                    <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-accent-electric rounded-full shadow-[0_0_8px_#00f2ff]"></span>
                </button>

                {activeOfficeId && profile?.role !== 'MEMBER' && (
                    <button
                        onClick={onJobCreateClick}
                        className="glass-premium flex items-center gap-2 px-6 py-2.5 text-white border-none cursor-pointer hover-glow active:scale-95 group"
                    >
                        <PlusCircle size={18} className="text-accent-electric group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-bold tracking-tighter text-sm">INITIATE JOB</span>
                    </button>
                )}
            </div>
        </header>
    );
};
