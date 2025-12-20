import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useParams } from 'react-router-dom';
import type { UserProfile } from '@/types/team';

export const OfficeTeam: React.FC = () => {
    const { officeId } = useParams();
    const { profile } = useAuth();
    const { departments } = useOrganization();
    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-accent-electric animate-pulse">Loading roster...</div>;

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.length === 0 ? (
                    <div className="glass p-12 text-center text-text-muted col-span-full border border-white/5">
                        No staff found in this scope.
                    </div>
                ) : (
                    staff.map((user) => (
                        <div key={user.uid} className="glass p-6 border border-white/5 hover:border-accent-electric/20 transition-all group flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center text-lg font-bold text-white shadow-lg overflow-hidden">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        user.displayName?.[0] || 'U'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-accent-electric transition-colors">{user.displayName}</h3>
                                    <div className="text-xs text-text-muted flex items-center gap-2 mt-1 uppercase tracking-wider font-medium">
                                        <Shield size={10} className="text-accent-primary" />
                                        {user.role}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 mt-auto">
                                <div className="flex flex-col gap-2 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2" title="Department">
                                        <span className={`w-2 h-2 rounded-full ${user.departmentId ? 'bg-accent-electric' : 'bg-gray-500'}`} />
                                        {getDeptName(user.departmentId)}
                                    </div>
                                    <div className="flex items-center gap-2 truncate" title={user.email}>
                                        <Mail size={14} className="text-text-muted" />
                                        {user.email}
                                    </div>
                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-text-muted" />
                                            {user.phoneNumber}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
