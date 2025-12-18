import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserRole } from '../../types';
import { DEMO_USERS } from '../../config/demoUsers';

export const LoginPage: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const { user } = userCredential;

                // For demo purposes, the first user is an OWNER of a new org
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: name,
                    role: 'OWNER' as UserRole,
                    orgId: `org_${user.uid.slice(0, 5)}`,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // Initialize Org
                await setDoc(doc(db, 'organizations', `org_${user.uid.slice(0, 5)}`), {
                    id: `org_${user.uid.slice(0, 5)}`,
                    name: `${name}'s Restoration`,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                    settings: { theme: 'dark' }
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0c 100%)'
        }}>
            <div className="glass" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '8px' }} className="gradient-text">GAMUT</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.875rem' }}>
                    Restoration Management Reimagined
                </p>

                {error && <div style={{ color: '#ff4444', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: '#fff'
                                }}
                            />
                        </div>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                color: '#fff'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                color: '#fff'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            marginBottom: '16px'
                        }}
                    >
                        {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ color: 'var(--accent-electric)', cursor: 'pointer' }}
                    >
                        {isRegister ? 'Sign In' : 'Create One'}
                    </span>
                </p>

                {!isRegister && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                            Demo Accounts (password123)
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {DEMO_USERS.map((demo) => (
                                <button
                                    key={demo.email}
                                    onClick={() => {
                                        setEmail(demo.email);
                                        setPassword('password123');
                                    }}
                                    style={{
                                        padding: '8px',
                                        fontSize: '0.75rem',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent-electric)')}
                                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                                    title={demo.email}
                                >
                                    {demo.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
