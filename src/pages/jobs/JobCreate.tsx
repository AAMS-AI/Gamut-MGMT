import React, { useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    query,
    where,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { type Office, type Department, type JobStatus } from '../../types';
import { ShieldAlert, Send } from 'lucide-react';

export const JobCreate: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { profile } = useAuth();
    const [offices, setOffices] = useState<Office[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [officeId, setOfficeId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [carrier, setCarrier] = useState('');
    const [claimNumber, setClaimNumber] = useState('');

    useEffect(() => {
        if (!profile?.orgId) return;

        const qOffices = query(collection(db, 'offices'), where('orgId', '==', profile.orgId));
        const unsubOffices = onSnapshot(qOffices, (snap) => {
            setOffices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Office)));
        });

        return () => unsubOffices();
    }, [profile?.orgId]);

    useEffect(() => {
        if (!officeId) {
            setDepartments([]);
            return;
        }
        const qDepts = query(collection(db, 'departments'), where('officeId', '==', officeId));
        const unsubDepts = onSnapshot(qDepts, (snap) => {
            setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
        });
        return () => unsubDepts();
    }, [officeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setLoading(true);

        try {
            await addDoc(collection(db, 'jobs'), {
                orgId: profile.orgId,
                officeId,
                departmentId,
                status: 'FNOL' as JobStatus,
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    email: ''
                },
                property: {
                    address,
                    city: '',
                    state: '',
                    zip: ''
                },
                insurance: {
                    carrier,
                    claimNumber
                },
                assignedUserIds: [profile.uid],
                createdBy: profile.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '32px', position: 'relative' }}>
                <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert style={{ color: 'var(--accent-electric)' }} /> New FNOL (First Notice of Loss)
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Office</label>
                            <select
                                value={officeId}
                                onChange={(e) => setOfficeId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            >
                                <option value="">Select Office</option>
                                {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Department</label>
                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                required
                                disabled={!officeId}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Customer & Property</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                            <input
                                placeholder="Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            />
                            <input
                                placeholder="Phone Number"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            />
                        </div>
                        <input
                            placeholder="Full Property Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Insurance Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <input
                                placeholder="Carrier (e.g. State Farm)"
                                value={carrier}
                                onChange={(e) => setCarrier(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            />
                            <input
                                placeholder="Claim #"
                                value={claimNumber}
                                onChange={(e) => setClaimNumber(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-electric))', border: 'none', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Send size={18} /> {loading ? 'Creating...' : 'Create Claim (FNOL)'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 0.3, padding: '14px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
