import React, { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { type Office, type Department } from '../../types';
import { Building2, MapPin, Plus, ListTree } from 'lucide-react';
import { hasPermission } from '../../hooks/useRBAC';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';

export const OrgManagement: React.FC = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { activeOffice } = useOrganization();
    const [offices, setOffices] = useState<Office[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Form states
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [officeName, setOfficeName] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');

    useEffect(() => {
        if (profile?.role === 'MEMBER') {
            navigate('/');
            return;
        }

        if (!profile?.orgId) return;
        let qOffices = query(collection(db, 'offices'), where('orgId', '==', profile.orgId));
        if (profile.role === 'OFFICE_ADMIN' || profile.role === 'DEPT_MANAGER') {
            if (profile.officeId) {
                qOffices = query(collection(db, 'offices'), where('orgId', '==', profile.orgId), where('id', '==', profile.officeId));
            }
        }

        const unsubOffices = onSnapshot(qOffices, (snap) => {
            setOffices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Office)));
        });

        // 2. Query Departments based on scope
        let qDepts = query(collection(db, 'departments'), where('orgId', '==', profile.orgId));
        if (profile.role === 'OFFICE_ADMIN') {
            if (profile.officeId) {
                qDepts = query(qDepts, where('officeId', '==', profile.officeId));
            }
        } else if (profile.role === 'DEPT_MANAGER') {
            if (profile.departmentId) {
                qDepts = query(qDepts, where('id', '==', profile.departmentId));
            }
        }

        const unsubDepts = onSnapshot(qDepts, (snap) => {
            setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
        });

        return () => {
            unsubOffices();
            unsubDepts();
        };
    }, [profile]);

    // Department form state
    const [showDeptForm, setShowDeptForm] = useState<string | null>(null); // officeId
    const [deptName, setDeptName] = useState('');

    const handleAddDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.orgId || !showDeptForm) return;

        try {
            await addDoc(collection(db, 'departments'), {
                orgId: profile.orgId,
                officeId: showDeptForm,
                name: deptName,
                managerId: profile.uid,
                createdAt: serverTimestamp()
            });
            setDeptName('');
            setShowDeptForm(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddOffice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.orgId) return;

        try {
            await addDoc(collection(db, 'offices'), {
                orgId: profile.orgId,
                name: officeName,
                address: officeAddress,
                managerId: profile.uid, // Default to creator for now
                createdAt: serverTimestamp()
            });
            setOfficeName('');
            setOfficeAddress('');
            setShowOfficeForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                    {hasPermission(profile, 'VIEW_ORG_SETTINGS') ? 'Organization Management' : 'My Branch Information'}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {hasPermission(profile, 'VIEW_ORG_SETTINGS')
                        ? 'Manage your offices and departments across the organization.'
                        : `View details for ${activeOffice?.name || 'your assigned branch'}.`}
                </p>
            </header>

            {!hasPermission(profile, 'VIEW_ORG_SETTINGS') ? (
                <div className="glass" style={{ padding: '32px', textAlign: 'center' }}>
                    <Building2 size={48} style={{ color: 'var(--accent-electric)', marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Restricted Access</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                        You have limited visibility into organizational settings. Please contact your Office Admin for any changes.
                    </p>
                </div>
            ) : (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={20} /> Offices
                        </h3>
                        {hasPermission(profile, 'MANAGE_OFFICES') && (
                            <button
                                onClick={() => setShowOfficeForm(true)}
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={18} /> Add Office
                            </button>
                        )}
                    </div>

                    {showOfficeForm && (
                        <form onSubmit={handleAddOffice} className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Office Name</label>
                                    <input
                                        type="text"
                                        value={officeName}
                                        onChange={(e) => setOfficeName(e.target.value)}
                                        placeholder="e.g. Downtown Branch"
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Address</label>
                                    <input
                                        type="text"
                                        value={officeAddress}
                                        onChange={(e) => setOfficeAddress(e.target.value)}
                                        placeholder="123 Main St..."
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ background: 'var(--accent-electric)', color: '#000', fontWeight: 600, border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Save Office</button>
                                <button type="button" onClick={() => setShowOfficeForm(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {offices.map(office => (
                            <div key={office.id} className="glass" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{office.name}</h4>
                                    <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>{office.address}</p>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                    <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ListTree size={14} /> Departments
                                    </h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {departments.filter(d => d.officeId === office.id).map(dept => (
                                            <span key={dept.id} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {dept.name}
                                            </span>
                                        ))}
                                        <button
                                            onClick={() => setShowDeptForm(office.id)}
                                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                                        >
                                            + Add Dept
                                        </button>
                                    </div>
                                </div>

                                {showDeptForm === office.id && (
                                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                        <form onSubmit={handleAddDept}>
                                            <input
                                                type="text"
                                                value={deptName}
                                                onChange={(e) => setDeptName(e.target.value)}
                                                placeholder="Dept Name (e.g. Mitigation)"
                                                required
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.875rem', marginBottom: '8px' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="submit" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>Save</button>
                                                <button type="button" onClick={() => setShowDeptForm(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '0.75rem' }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
