import React, { useState, type ReactNode, useEffect } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    LogOut,
    PlusCircle,
    Building2,
    MapPin,
    ChevronDown,
    Shield,
    Network,
    Globe,
    ClipboardList
} from 'lucide-react';
import { type Department, type Office, type Organization, type UserProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { JobCreate } from '@/pages/jobs/JobCreate';

// --- Types ---
interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active }) => (
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

// --- Context Switcher ---
const SidebarContextSwitcher: React.FC<{
    organization: Organization | null;
    offices: Office[];
    departments: Department[];
    activeOfficeId: string | null;
    activeDepartmentId: string | null;
    setActiveDepartmentId: (id: string | null) => void;
    userRole?: string;
    userProfile?: UserProfile | null;
}> = ({ organization, offices, departments, activeOfficeId, activeDepartmentId, setActiveDepartmentId, userRole, userProfile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedOfficeId, setExpandedOfficeId] = useState<string | null>(null);
    const navigate = useNavigate();
    const activeOffice = offices.find(o => o.id === activeOfficeId);
    const activeDepartment = departments.find(d => d.id === activeDepartmentId);

    // Sync expanded state likely to active office on mount/change
    useEffect(() => {
        if (activeOfficeId && expandedOfficeId !== activeOfficeId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpandedOfficeId(activeOfficeId);
        }
    }, [activeOfficeId, expandedOfficeId]);

    const handleSwitch = (officeId: string | null, departmentId: string | null = null) => {
        if (officeId) {
            setActiveDepartmentId(departmentId);
            navigate(`/office/${officeId}/dashboard`);
        } else {
            setActiveDepartmentId(null);
            navigate('/');
        }
        setIsOpen(false);
    };

    const toggleExpansion = (officeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedOfficeId(prev => prev === officeId ? null : officeId);
    };

    const renderOfficeContent = (o: Office) => {
        let officeDepts = departments.filter(d => d.officeId === o.id);

        if (userRole === 'MEMBER' && userProfile?.departmentId) {
            officeDepts = officeDepts.filter(d => d.id === userProfile.departmentId);
        }

        const isActiveOffice = activeOfficeId === o.id;
        // "Overview" is active if we are in this office but NO department is selected
        const isOverviewActive = isActiveOffice && !activeDepartmentId;

        return (
            <div className="pl-3 mt-1 mb-2">
                <button
                    onClick={() => handleSwitch(o.id, null)}
                    className={`w-full p-2.5 flex items-center gap-2.5 bg-transparent border-none rounded-lg text-text-secondary cursor-pointer text-left transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-white mb-1 ${isOverviewActive ? 'bg-[rgba(192,132,252,0.1)] text-[#c084fc]' : ''
                        }`}
                >
                    <MapPin size={14} />
                    <span className="text-xs font-semibold">Office Overview</span>
                </button>
                <div className="h-px bg-white/10 my-1 opacity-50" />
                {officeDepts.map(d => (
                    <button
                        key={d.id}
                        onClick={() => handleSwitch(o.id, d.id)}
                        className={`w-full p-2.5 flex items-center gap-2.5 rounded-lg cursor-pointer text-left transition-all duration-200 border ${activeDepartmentId === d.id
                            ? 'bg-accent-electric/10 border-accent-electric/30 text-accent-electric shadow-[0_0_10px_rgba(0,242,255,0.1)]'
                            : 'bg-transparent border-transparent text-text-secondary'
                            }`}
                    >
                        <div
                            className={`w-1.5 h-1.5 rounded-full bg-current ${activeDepartmentId === d.id ? 'opacity-100' : 'opacity-50'}`}
                        />
                        <span className={`text-xs ${activeDepartmentId === d.id ? 'font-bold' : 'font-medium'}`}>{d.name}</span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative mb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer transition-all duration-200 text-left ${isOpen ? 'bg-[rgba(255,255,255,0.08)] border-accent-electric' : ''
                    }`}
            >
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activeDepartmentId
                        ? 'bg-accent-electric/10 text-accent-electric shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                        : 'bg-purple-500/10 text-[#c084fc]'
                        }`}
                >
                    {activeOfficeId ? <MapPin size={18} /> : <Globe size={18} />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-[0.8125rem] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                        {activeDepartment ? activeDepartment.name : (activeOfficeId ? activeOffice?.name : organization?.name)}
                    </div>
                    <div className="text-[0.6875rem] text-text-muted font-medium">
                        {activeDepartment ? 'Department View' : (activeOfficeId ? 'Branch Hub' : 'Enterprise Global')}
                    </div>
                </div>
                <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40"
                    />
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#141414]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-2 z-50 shadow-2xl animate-[fadeInScale_0.2s_ease-out] max-h-[400px] overflow-y-auto">
                        <div className="text-[0.65rem] font-bold text-text-muted py-2 px-3 uppercase tracking-wider">
                            Switch Perspective
                        </div>

                        {/* --- OWNER / MULTI-OFFICE VIEW --- */}
                        {(userRole === 'OWNER' || userRole === 'ORG_ADMIN' || offices.length > 1) ? (
                            <>
                                {(userRole === 'OWNER' || userRole === 'ORG_ADMIN') && (
                                    <button
                                        onClick={() => handleSwitch(null)}
                                        className={`w-full p-2.5 flex items-center gap-2.5 bg-transparent border-none rounded-lg text-text-secondary cursor-pointer text-left transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-white ${!activeOfficeId ? 'bg-[rgba(192,132,252,0.1)] text-[#c084fc]' : ''
                                            }`}
                                    >
                                        <Globe size={14} />
                                        <span className="text-[0.8125rem] font-semibold">Global Overview</span>
                                    </button>
                                )}
                                <div className="h-px bg-white/10 my-1" />

                                {offices.map(o => {
                                    const isExpanded = expandedOfficeId === o.id;
                                    const isActiveOffice = activeOfficeId === o.id;

                                    return (
                                        <div key={o.id}>
                                            <div
                                                className={`w-full p-2.5 flex items-center justify-between bg-transparent border-none rounded-lg text-text-secondary cursor-pointer text-left transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-white ${isActiveOffice ? 'bg-[rgba(192,132,252,0.1)] text-[#c084fc]' : ''
                                                    }`}
                                                // Main Click -> Navigate to Office Global
                                                onClick={() => handleSwitch(o.id, null)}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <MapPin size={14} />
                                                    <span className="text-[0.8125rem] font-semibold">{o.name}</span>
                                                </div>

                                                {/* Chevron Click -> Toggle Expansion Only */}
                                                <div
                                                    onClick={(e) => toggleExpansion(o.id, e)}
                                                    className="p-1 -m-1 flex items-center justify-center rounded"
                                                >
                                                    <ChevronDown size={12} className={`opacity-70 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Nested Content (Depts Only) */}
                                            {isExpanded && renderOfficeContent(o)}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            /* --- SINGLE OFFICE / MANAGER VIEW (FLATTENED) --- */
                            activeOffice && renderOfficeContent(activeOffice)
                        )}
                    </div >
                </>
            )}
        </div>
    );
};

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { profile, signOut } = useAuth();
    const { organization, offices, departments, activeOfficeId, activeDepartmentId, setActiveOfficeId, setActiveDepartmentId } = useOrganization();
    const location = useLocation();
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
    let navItems = [];

    if (effectiveOfficeId) {
        // === BRANCH MODE ===
        navItems = [
            { icon: LayoutDashboard, label: 'Hub Pulse', to: `/office/${effectiveOfficeId}/dashboard` },
            { icon: Briefcase, label: 'Claims', to: `/office/${effectiveOfficeId}/jobs` },
            { icon: ClipboardList, label: 'Operations', to: `/office/${effectiveOfficeId}/ops` },
            { icon: Network, label: 'Departments', to: `/office/${effectiveOfficeId}/depts` },
            { icon: Users, label: 'Staff Roster', to: `/office/${effectiveOfficeId}/team` },
        ];
    } else {
        // === GLOBAL MODE ===
        navItems = [
            { icon: Shield, label: 'Enterprise Dash', to: '/' },
            { icon: Briefcase, label: 'All Claims', to: '/jobs' },
            { icon: Building2, label: 'Branch Directory', to: '/org' },
            { icon: Users, label: 'Global Staff', to: '/users' },
        ];
    }

    return (
        <div className="flex min-h-screen bg-black text-white font-sans">
            <aside className="w-72 border-r border-white/10 p-6 flex flex-col fixed h-screen z-10 bg-[#141414]/60 backdrop-blur-[20px]">
                <div className="mb-8 flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent-primary to-accent-electric flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(0,242,255,0.3)]">G</div>
                    <h1 className="text-xl font-extrabold tracking-tight m-0 bg-linear-to-br from-accent-primary to-accent-electric text-transparent bg-clip-text">GAMUT</h1>
                </div>

                <SidebarContextSwitcher
                    organization={organization}
                    offices={
                        (profile?.role === 'OWNER' || profile?.role === 'ORG_ADMIN')
                            ? offices
                            : offices.filter(o => o.id === profile?.officeId)
                    }
                    departments={departments} // Pass props
                    activeOfficeId={activeOfficeId}
                    activeDepartmentId={activeDepartmentId} // Pass props
                    setActiveDepartmentId={setActiveDepartmentId} // Pass props
                    userRole={profile?.role}
                    userProfile={profile}
                />

                <nav className="flex-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-[10px] bg-bg-tertiary flex items-center justify-center text-sm font-semibold">
                            {profile?.displayName?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                {profile?.displayName || 'User'}
                            </div>
                            <div className="text-xs text-text-muted capitalize">
                                {profile?.role.replace('_', ' ')}
                            </div>
                            {/* Show Assigned Department (Identity) */}
                            {profile?.departmentId && (
                                <div className="text-[0.7rem] text-accent-electric font-medium mt-0.5">
                                    {departments.find(d => d.id === profile.departmentId)?.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ff4444] bg-transparent border-none transition-all duration-200 cursor-pointer hover:bg-[rgba(255,68,68,0.1)]"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ms-72 flex-1 p-8 min-h-screen">
                <header className="mb-8 flex justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="shrink-0">
                            <h2 className="text-2xl font-extrabold tracking-tight m-0 text-white whitespace-nowrap">
                                {activeOfficeId ? (activeOffice?.name || 'Branch Hub') : 'Enterprise Command Center'}
                            </h2>
                        </div>

                        {/* Context Badge */}
                        <div
                            className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${activeDepartmentId
                                ? 'bg-accent-electric/10 border-accent-electric/30 text-accent-electric shadow-[0_0_15px_rgba(0,242,255,0.05)]'
                                : 'bg-purple-500/10 border-purple-500/30 text-[#c084fc]'
                                }`}
                        >
                            {activeOfficeId ? <MapPin size={12} /> : <Shield size={12} />}
                            {activeOfficeId
                                ? (activeDepartmentId
                                    ? `${departments.find(d => d.id === activeDepartmentId)?.name || 'Department'} View`
                                    : 'Office Overview')
                                : 'Global Scope'}
                        </div>
                    </div>

                    {activeOfficeId && profile?.role !== 'MEMBER' && (
                        <button
                            onClick={() => setShowJobModal(true)}
                            className="glass flex items-center gap-2 px-4 py-2 text-white border-none cursor-pointer"
                        >
                            <PlusCircle size={18} />
                            <span>Create Job</span>
                        </button>
                    )}
                </header>
                {children}

                {showJobModal && <JobCreate onClose={() => setShowJobModal(false)} />}
            </main>
        </div>
    );
};
