import { createContext, useContext } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const { user, loading, login, logout, refreshUser } = useFirebaseAuth();

    // Derived Booleans from Role String
    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const isMember = user?.role === 'member';

    // Grouped Permissions
    const hasFullAccess = isOwner || isAdmin;

    const value = {
        user,
        login,
        logout,
        refreshUser,
        loading,
        isAuthenticated: !!user,
        organizationId: user?.organizationId,
        userTeamId: user?.teamId,
        role: user?.role,

        // Role Checks (Boolean)
        isOwner,
        isAdmin,
        isManager,
        isMember,

        // Permissions
        canManageAllUsers: hasFullAccess,
        canManageTeamUsers: isManager,
        canViewOrganizationSettings: hasFullAccess,
        canViewAllTeams: hasFullAccess,
        canApprove: hasFullAccess || isManager,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
