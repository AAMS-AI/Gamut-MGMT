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
    const { user, loading, login, logout } = useFirebaseAuth();

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isOrgOwner: user?.role === 'org_owner',
        isManager: user?.role === 'manager',
        isTeamMember: user?.role === 'team_member',
        hasAdminRights: user?.hasAdminRights || user?.role === 'org_owner',
        canViewAllTeams: user?.role === 'org_owner' || user?.hasAdminRights,
        canApprove: user?.role === 'org_owner' || user?.role === 'manager',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
