import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { updateProfile, sendPasswordResetEmail, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import {
    User,
    Mail,
    Briefcase,
    Building2,
    MapPin,
    Calendar,
    Shield,
    Settings,
    Key,
    Save,
    Check,
    AlertCircle,
    Phone,
    Camera,
    Loader2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { profile } = useAuth();
    const { organization, offices, departments } = useOrganization();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

    // Edit State
    const [displayName, setDisplayName] = useState(profile?.displayName || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [phone, setPhone] = useState(profile?.phoneNumber || '');

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Derived helpers
    const getOfficeName = (id?: string) => offices.find(o => o.id === id)?.name || 'N/A';
    const getDeptName = (id?: string) => departments.find(d => d.id === id)?.name || 'N/A';
    const formatDate = (timestamp: { toDate?: () => Date } | Date | null | undefined) => {
        if (!timestamp) return 'N/A';
        const date = (timestamp as { toDate?: () => Date }).toDate
            ? (timestamp as { toDate: () => Date }).toDate()
            : new Date(timestamp as Date);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setErrorMsg('Image size must be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            setErrorMsg('');

            // Create storage reference
            const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get download URL
            const photoURL = await getDownloadURL(storageRef);

            // Update Auth Profile
            await updateProfile(auth.currentUser, { photoURL });

            // Update Firestore
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { photoURL, updatedAt: new Date() });

            setSuccessMsg('Profile picture updated!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error uploading image:', err);
            setErrorMsg('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUpdateName = async () => {
        if (!displayName.trim()) return;
        setLoading(true);
        setErrorMsg('');
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, { displayName, updatedAt: new Date() });

                setSuccessMsg('Display name updated successfully');
                setIsEditingName(false);
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to update display name');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePhone = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (auth.currentUser) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, { phoneNumber: phone, updatedAt: new Date() });

                setSuccessMsg('Phone number updated successfully');
                setIsEditingPhone(false);
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to update phone number');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!email.trim() || !auth.currentUser) return;
        setLoading(true);
        setErrorMsg('');
        try {
            await updateEmail(auth.currentUser, email);

            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { email, updatedAt: new Date() });

            setSuccessMsg('Email updated! Please verify if a confirmation was sent.');
            setIsEditingEmail(false);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            console.error(err);
            const error = err as { code?: string; message?: string };
            if (error.code === 'auth/requires-recent-login') {
                setErrorMsg('Security Requirement: Please logout and login again to change your email.');
            } else {
                setErrorMsg(error.message || 'Failed to update email');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!profile?.email) return;
        setLoading(true);
        setErrorMsg('');
        try {
            await sendPasswordResetEmail(auth, profile.email);
            setSuccessMsg(`Password reset email sent to ${profile.email}`);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
            {/* Header / Banner area */}
            <header className="relative overflow-hidden rounded-3xl bg-[#0f172a] border border-white/10">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-electric/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="group relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-3xl bg-linear-to-br from-gray-800 to-gray-900 ring-4 ring-white/5 shadow-2xl overflow-hidden cursor-pointer">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-bold text-white">
                                    {profile.displayName?.[0] || 'U'}
                                </div>
                            )}

                            {/* Upload Overlay */}
                            <div
                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <Camera size={24} className="mb-1" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Change</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0 pt-2">
                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-accent-electric/10 border border-accent-electric/20 text-accent-electric text-[10px] uppercase font-bold tracking-wider">
                                    {profile.role.replace('_', ' ')}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                                    <Building2 size={12} />
                                    {organization?.name || 'Organization'}
                                </span>
                            </div>

                            {/* Name */}
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 truncate">
                                {profile.displayName}
                            </h1>

                            {/* Contact Grid */}
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-text-muted font-medium">
                                <div className="flex items-center gap-2 transition-colors hover:text-white group cursor-default">
                                    <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent-electric/10 group-hover:text-accent-electric transition-colors">
                                        <Mail size={14} />
                                    </div>
                                    {profile.email}
                                </div>
                                {profile.phoneNumber && (
                                    <div className="flex items-center gap-2 transition-colors hover:text-white group cursor-default">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent-electric/10 group-hover:text-accent-electric transition-colors">
                                            <Phone size={14} />
                                        </div>
                                        {profile.phoneNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Bar */}
                <div className="relative z-10 bg-black/20 border-t border-white/5 px-8 md:px-10">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview'
                                ? 'border-accent-electric text-accent-electric'
                                : 'border-transparent text-text-muted hover:text-white hover:border-white/20'
                                }`}
                        >
                            <User size={16} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings'
                                ? 'border-accent-electric text-accent-electric'
                                : 'border-transparent text-text-muted hover:text-white hover:border-white/20'
                                }`}
                        >
                            <Settings size={16} /> Account Settings
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages */}
            {successMsg && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <Check size={20} /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={20} /> {errorMsg}
                </div>
            )}

            {/* Content Tabs */}
            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass p-8">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Shield size={18} className="text-accent-primary" /> Role & System Access
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Current Role</div>
                                <div className="text-xl font-bold text-white capitalize">{profile.role.replace('_', ' ')}</div>
                                <div className="text-xs text-text-muted mt-1 leading-snug">
                                    {profile.role === 'OWNER' ? 'Full system access and billing control.' :
                                        profile.role === 'ORG_ADMIN' ? 'Organization-wide management access.' :
                                            'Standard access to assigned resources.'}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Account Created</div>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar size={16} className="text-text-muted" />
                                    {formatDate(profile.createdAt)}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">User Identifier</div>
                                <div className="font-mono text-[10px] text-text-muted bg-black/20 p-2 rounded border border-white/5 truncate">
                                    {profile.uid}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Building2 size={18} className="text-accent-electric" /> Work Context
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Building2 size={20} className="text-text-muted" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Organization</div>
                                    <div className="font-bold text-lg">{organization?.name}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin size={20} className="text-text-muted" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Office Location</div>
                                    <div className="font-bold text-lg">
                                        {profile.officeId ? getOfficeName(profile.officeId) : <span className="text-accent-electric italic">Global / All Offices</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Briefcase size={20} className="text-text-muted" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Department</div>
                                    <div className="font-bold text-lg">
                                        {profile.departmentId ? getDeptName(profile.departmentId) : <span className="text-accent-electric italic">Global / All Depts</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Settings Tab */}
                    <div className="glass p-8">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <User size={18} className="text-accent-electric" /> Profile Details
                        </h3>

                        <div className="space-y-6 max-w-lg">
                            {/* Display Name */}
                            <div>
                                <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Display Name</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            disabled={!isEditingName || loading}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric disabled:opacity-50"
                                        />
                                    </div>
                                    {isEditingName ? (
                                        <>
                                            <button
                                                onClick={handleUpdateName}
                                                disabled={loading}
                                                className="bg-accent-electric text-black px-4 rounded-xl font-bold hover:brightness-110 flex items-center justify-center"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setIsEditingName(false); setDisplayName(profile.displayName || ''); }}
                                                disabled={loading}
                                                className="bg-white/5 text-white px-4 rounded-xl font-bold hover:bg-white/10 flex items-center justify-center"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="bg-white/5 text-white px-6 rounded-xl font-semibold hover:bg-white/10 border border-white/5"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted mt-2">
                                    This name will be displayed across the platform on items you create or modify.
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Email Address</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={!isEditingEmail || loading}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric disabled:opacity-50"
                                        />
                                    </div>
                                    {isEditingEmail ? (
                                        <>
                                            <button
                                                onClick={handleUpdateEmail}
                                                disabled={loading}
                                                className="bg-accent-electric text-black px-4 rounded-xl font-bold hover:brightness-110 flex items-center justify-center"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setIsEditingEmail(false); setEmail(profile.email || ''); }}
                                                disabled={loading}
                                                className="bg-white/5 text-white px-4 rounded-xl font-bold hover:bg-white/10 flex items-center justify-center"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingEmail(true)}
                                            className="bg-white/5 text-white px-6 rounded-xl font-semibold hover:bg-white/10 border border-white/5"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs mt-2 text-yellow-500/80">
                                    Changing your email may require you to re-login to verify your identity.
                                </p>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Phone Number</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={!isEditingPhone || loading}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric disabled:opacity-50"
                                        />
                                    </div>
                                    {isEditingPhone ? (
                                        <>
                                            <button
                                                onClick={handleUpdatePhone}
                                                disabled={loading}
                                                className="bg-accent-electric text-black px-4 rounded-xl font-bold hover:brightness-110 flex items-center justify-center"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setIsEditingPhone(false); setPhone(profile.phoneNumber || ''); }}
                                                disabled={loading}
                                                className="bg-white/5 text-white px-4 rounded-xl font-bold hover:bg-white/10 flex items-center justify-center"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingPhone(true)}
                                            className="bg-white/5 text-white px-6 rounded-xl font-semibold hover:bg-white/10 border border-white/5"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 border-l-4 border-l-red-500/50">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Key size={18} className="text-red-400" /> Security & Login
                        </h3>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white mb-1">Password Check</div>
                                <div className="text-xs text-text-muted">
                                    Send a secure link to your email ({profile.email}) to reset your password.
                                </div>
                            </div>
                            <button
                                onClick={handlePasswordReset}
                                disabled={loading}
                                className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                                <Mail size={16} /> Send Reset Email
                            </button>
                        </div>
                    </div>

                    <div className="glass p-8 opacity-60 grayscale cursor-not-allowed relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center z-10 backdrop-blur-[1px]">
                            <span className="bg-black/50 px-4 py-2 rounded-full text-xs font-bold border border-white/10 text-text-muted">Coming Soon</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-6">Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Email Notifications</span>
                                <div className="w-10 h-5 rounded-full bg-white/10" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Dark Mode</span>
                                <div className="w-10 h-5 rounded-full bg-accent-electric" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
