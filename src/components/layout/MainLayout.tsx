import React, { useState, type ReactNode } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    LogOut,
    PlusCircle,
    Building2,
    MapPin,
    ChevronDown,
    Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Link, useLocation } from 'react-router-dom';
import { JobCreate } from '../../pages/jobs/JobCreate';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        color: active ? 'var(--accent-electric)' : 'var(--text-secondary)',
        backgroundColor: active ? 'rgba(0, 242, 255, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        marginBottom: '4px'
    }}>
        <Icon size={20} />
        <span style={{ fontWeight: 500 }}>{label}</span>
        {active && <div style={{
            marginLeft: 'auto',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-electric)',
            boxShadow: '0 0 10px var(--accent-electric)'
        }} />}
    </Link>
);

const SidebarContextSwitcher: React.FC<{
    organization: any;
    offices: any[];
    activeOfficeId: string | null;
    activeDepartment?: any;
    setActiveOfficeId: (id: string | null) => void;
    role?: string;
}> = ({ organization, offices, activeOfficeId, activeDepartment, setActiveOfficeId, role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeOffice = offices.find(o => o.id === activeOfficeId);

    if (role !== 'OWNER' && role !== 'ORG_ADMIN') {
        return (
            <div style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-electric))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                    }}>{activeOffice?.name?.[0] || 'B'}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeOffice?.name || 'Branch Hub'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-electric)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {activeDepartment ? activeDepartment.name : 'Immersed Mode'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', marginBottom: '32px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isOpen ? 'var(--accent-electric)' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left'
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: activeOfficeId ? 'rgba(0, 242, 255, 0.1)' : 'linear-gradient(135deg, var(--accent-primary), var(--accent-electric))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activeOfficeId ? 'var(--accent-electric)' : '#fff',
                    flexShrink: 0,
                    boxShadow: activeOfficeId ? 'none' : '0 0 15px rgba(0, 242, 255, 0.2)'
                }}>
                    {activeOfficeId ? <MapPin size={18} /> : <Globe size={18} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeOfficeId ? activeOffice?.name : organization?.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {activeOfficeId ? 'Branch Hub' : 'Enterprise Global'}
                    </div>
                </div>
                <ChevronDown size={14} style={{
                    color: 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s ease'
                }} />
            </button>

            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        padding: '8px',
                        zIndex: 50,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        animation: 'fadeInScale 0.2s ease-out'
                    }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Switch Perspective
                        </div>
                        <button
                            onClick={() => { setActiveOfficeId(null); setIsOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: !activeOfficeId ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: '10px',
                                color: !activeOfficeId ? 'var(--accent-electric)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Globe size={14} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Global Overview</span>
                        </button>
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                        {offices.map(o => (
                            <button
                                key={o.id}
                                onClick={() => { setActiveOfficeId(o.id); setIsOpen(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: activeOfficeId === o.id ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: activeOfficeId === o.id ? 'var(--accent-electric)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <MapPin size={14} />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{o.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { profile, signOut } = useAuth();
    const { organization, offices, activeOfficeId, activeDepartment, setActiveOfficeId } = useOrganization();
    const location = useLocation();
    const [showJobModal, setShowJobModal] = useState(false);

    const activeOffice = offices.find(o => o.id === activeOfficeId);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Briefcase, label: 'Jobs & Claims', to: '/jobs' },
    ];

    const isHQ = profile?.role === 'OWNER' || profile?.role === 'ORG_ADMIN';
    navItems.push({ icon: Users, label: isHQ ? 'Users & Teams' : 'Office Team', to: '/team' });

    if (profile?.role !== 'MEMBER') {
        navItems.push({ icon: Building2, label: isHQ ? 'Organization' : 'Branch Hub', to: '/org' });
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid var(--border-color)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10
            }} className="glass">
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-electric))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)'
                    }}>G</div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }} className="gradient-text">GAMUT</h1>
                </div>

                <SidebarContextSwitcher
                    organization={organization}
                    offices={offices}
                    activeOfficeId={activeOfficeId}
                    activeDepartment={activeDepartment}
                    setActiveOfficeId={setActiveOfficeId}
                    role={profile?.role}
                />

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}>
                            {profile?.displayName?.[0] || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profile?.displayName || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {profile?.role.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            color: '#ff4444',
                            backgroundColor: 'transparent',
                            border: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={20} />
                        <span style={{ fontWeight: 500 }}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
                <header style={{
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', transition: 'all 0.3s ease' }}>
                        <div style={{ marginRight: '24px' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                letterSpacing: '-0.03em',
                                margin: 0,
                                color: '#fff'
                            }}>
                                {location.pathname === '/' ? (activeOfficeId ? 'Branch Hub' : 'Enterprise Command Center') :
                                    location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)}
                            </h2>
                        </div>

                        {/* Context Badge */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            background: 'rgba(0, 242, 255, 0.05)',
                            border: '1px solid rgba(0, 242, 255, 0.15)',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--accent-electric)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 0 15px rgba(0, 242, 255, 0.05)'
                        }}>
                            {activeOfficeId ? <MapPin size={12} /> : <Building2 size={12} />}
                            {activeOfficeId ? activeOffice?.name : 'Global Perspective'}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowJobModal(true)}
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <PlusCircle size={18} />
                        <span>Create Job</span>
                    </button>
                </header>
                {children}

                {showJobModal && <JobCreate onClose={() => setShowJobModal(false)} />}
            </main>
        </div>
    );
};
