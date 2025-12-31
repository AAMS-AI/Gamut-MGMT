import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield, Plus } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams } from 'react-router-dom';
import type { UserProfile } from '@/types/team';
import { ManageUserModal } from './components/ManageUserModal';
import { Edit2 } from 'lucide-react';

export const OfficeTeam: React.FC = () => {
    const { officeId } = useParams();
    const { profile } = useAuth();
    const { departments } = useOrganization();
    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | undefined>(undefined);

    useEffect(() => {
        if (!officeId || !profile) return;

        const fetchStaff = async () => {
            try {
                // Base query: Users in this organization and office
                let q = query(
                    collection(db, 'users'),
                    where('orgId', '==', profile.orgId),
                    where('officeId', '==', officeId)
                );

                // If Member or Dept Manager, filter to only their department
                if ((profile.role === 'MEMBER' || profile.role === 'DEPT_MANAGER') && profile.departmentId) {
                    q = query(q, where('departmentId', '==', profile.departmentId));
                }

                const snapshot = await getDocs(q);
                const staffData = snapshot.docs.map(doc => doc.data() as UserProfile);
                setStaff(staffData);
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, [officeId, profile]);

    const getDeptName = (deptId?: string) => {
        if (!deptId) return 'Unassigned';
        return departments.find(d => d.id === deptId)?.name || 'Unknown Dept';
    };

    const handleManageUser = (user?: UserProfile) => {
        setSelectedUser(user);
        setShowManageModal(true);
    };

    if (loading) return <div className="p-8 text-accent-electric animate-pulse">Loading roster...</div>;

    // --- Grouping Logic ---
    const officeLeadership = staff.filter(u => ['OWNER', 'ORG_ADMIN', 'OFFICE_ADMIN'].includes(u.role));
    const unassignedMembers = staff.filter(u => u.role === 'MEMBER' && !u.departmentId);

    // Get relevant departments (either all for this office, or just the user's if restricted)
    const effectiveDepartments = (profile?.role === 'MEMBER' || profile?.role === 'DEPT_MANAGER')
        ? departments.filter(d => d.id === profile.departmentId)
        : departments.filter(d => d.officeId === officeId);

    const renderUserCard = (user: UserProfile, isLeader: boolean = false) => (
        <div key={user.uid} className={`glass p-6 border border-white/5 hover:border-accent-electric/20 transition-all group flex flex-col gap-4 ${isLeader ? 'bg-accent-electric/5 border-accent-electric/20' : ''}`}>
            <div className="flex items-center gap-4 relative">
                {/* Edit Button Overlay (Admins Only) */}
                {profile?.role !== 'MEMBER' && (
                    <button
                        onClick={() => handleManageUser(user)}
                        className="absolute top-0 right-0 p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Edit2 size={16} />
                    </button>
                )}

                <div className={`rounded-xl bg-bg-tertiary flex items-center justify-center text-lg font-bold text-white shadow-lg overflow-hidden ${isLeader ? 'w-16 h-16' : 'w-12 h-12'}`}>
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        user.displayName?.[0] || 'U'
                    )}
                </div>
                <div>
                    <h3 className={`font-bold text-white group-hover:text-accent-electric transition-colors ${isLeader ? 'text-xl' : 'text-base'}`}>{user.displayName}</h3>
                    <div className="text-xs text-text-muted flex items-center gap-2 mt-1 uppercase tracking-wider font-medium">
                        <Shield size={10} className="text-accent-primary" />
                        {user.role.replace('_', ' ')}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-auto">
                <div className="flex flex-col gap-2 text-sm text-text-secondary">
                    {/* Only show dept if we represent miscellaneous group, otherwise context implies dept */}
                    {!user.departmentId && (
                        <div className="flex items-center gap-2" title="Department">
                            <span className={`w-2 h-2 rounded-full ${user.departmentId ? 'bg-accent-electric' : 'bg-gray-500'}`} />
                            {getDeptName(user.departmentId)}
                        </div>
                    )}
                    <div className="flex items-center gap-2 truncate" title={user.email}>
                        <Mail size={14} className="text-text-muted" />
                        {user.email}
                    </div>
                    <div className={`flex items-center gap-2 truncate ${user.phoneNumber ? '' : 'opacity-40'}`} title={user.phoneNumber || 'No phone number'}>
                        <Phone size={14} className="text-text-muted" />
                        {user.phoneNumber || '###-###-####'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <header>
                <div className="text-accent-electric text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14} /> Team Management
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                    {profile?.role === 'MEMBER' ? 'Department Roster' : 'Staff Roster'}
                </h1>
                <p className="text-text-secondary mt-2">
                    {profile?.role === 'MEMBER'
                        ? 'Your colleagues in this department.'
                        : 'Manage your office personnel and assignments.'}
                </p>
            </header>

            {/* Actions Bar */}
            {profile?.role !== 'MEMBER' && (
                <div className="flex justify-end -mt-8">
                    <button
                        onClick={() => handleManageUser(undefined)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-electric text-black font-bold rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-accent-electric/20"
                    >
                        <Plus size={18} />
                        Add Team Member
                    </button>
                </div>
            )}

            {showManageModal && (
                <ManageUserModal
                    initialData={selectedUser}
                    onClose={() => setShowManageModal(false)}
                    onSuccess={() => {
                        setShowManageModal(false);
                        window.location.reload();
                    }}
                />
            )}

            <div className="flex flex-col gap-10 pb-20">
                {/* 1. Office Leadership (Admins/Owners) - Only show if current user can see them (Usually yes) */}
                {officeLeadership.length > 0 && (
                    <section>
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                            <Shield size={16} className="text-accent-primary" /> Office Leadership
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {officeLeadership.map(u => renderUserCard(u, true))}
                        </div>
                    </section>
                )}

                {/* 2. Departments */}
                {effectiveDepartments.map(dept => {
                    const deptStaff = staff.filter(u => u.departmentId === dept.id);
                    if (deptStaff.length === 0) return null; // Skip empty departments

                    const managers = deptStaff.filter(u => u.role === 'DEPT_MANAGER');
                    const members = deptStaff.filter(u => u.role === 'MEMBER');

                    return (
                        <section key={dept.id} className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/5">
                            {/* Dept Header */}
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-accent-electric/20 flex items-center justify-center text-accent-electric font-bold">
                                    {dept.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{dept.name}</h2>
                                    <p className="text-sm text-text-muted">{managers.length} Manager(s) • {members.length} Member(s)</p>
                                </div>
                            </div>

                            {/* Managers Row */}
                            {managers.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Shield size={12} /> Department Leadership
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {managers.map(u => renderUserCard(u, true))}
                                    </div>
                                </div>
                            )}

                            {/* Members Grid */}
                            <div>
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Users size={12} /> Team Members
                                </h3>
                                {members.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {members.map(u => renderUserCard(u, false))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-text-muted italic bg-white/5 p-4 rounded-xl border border-dashed border-white/10 text-center">
                                        No members assigned yet.
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}

                {/* 3. Unassigned Members */}
                {unassignedMembers.length > 0 && (
                    <section>
                        <h2 className="text-base font-bold text-text-secondary mb-4 flex items-center gap-2 uppercase tracking-wide opacity-70">
                            <Users size={16} /> Unassigned Staff
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {unassignedMembers.map(u => renderUserCard(u, false))}
                        </div>
                    </section>
                )}

                {staff.length === 0 && !loading && (
                    <div className="glass p-12 text-center text-text-muted border border-white/5">
                        No staff found in this scope.
                    </div>
                )}
            </div >
        </div >
    );
};
