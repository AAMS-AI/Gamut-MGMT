/**
 * RBAC Configuration
 * 
 * This file defines the Roles and Permissions for the application.
 * Ideally, these should mirror the backend configuration in `backend/rbac.py`.
 */

export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MANAGER: 'manager',
    LEAD: 'lead',
    MEMBER: 'member',
};

export const PERMISSIONS = {
    // User Management
    MANAGE_ALL_USERS: 'manage_all_users',      // Create/Edit any user
    MANAGE_TEAM_USERS: 'manage_team_users',    // Create/Edit users in own team
    VIEW_ALL_USERS: 'view_all_users',          // List all users in org
    VIEW_TEAM_USERS: 'view_team_users',        // List users in own team

    // Team Management
    MANAGE_TEAMS: 'manage_teams',              // Create/Edit/Delete teams
    VIEW_ALL_TEAMS: 'view_all_teams',          // View all teams
    VIEW_OWN_TEAM: 'view_own_team',            // View own team details


    // Organization
    VIEW_ORG_SETTINGS: 'view_org_settings',    // View org settings
    MANAGE_ORG_SETTINGS: 'manage_org_settings',// Edit org settings
};

// Map Roles to Permissions
export const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: [
        // Owner has everything
        PERMISSIONS.MANAGE_ALL_USERS,
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.MANAGE_TEAMS,
        PERMISSIONS.VIEW_ALL_TEAMS,

        PERMISSIONS.VIEW_ORG_SETTINGS,
        PERMISSIONS.MANAGE_ORG_SETTINGS,
    ],
    [ROLES.ADMIN]: [
        // Admin is like Owner but usually can't delete the Owner
        PERMISSIONS.MANAGE_ALL_USERS,
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.MANAGE_TEAMS,
        PERMISSIONS.VIEW_ALL_TEAMS,

        PERMISSIONS.VIEW_ORG_SETTINGS,
        // Cannot manage org settings (financials etc)? Let's say yes for now or no depending on business logic. 
        // Based on existing code, admin had less than owner. Let's give them view org but not manage.
        PERMISSIONS.VIEW_ORG_SETTINGS,
    ],
    [ROLES.MANAGER]: [
        PERMISSIONS.MANAGE_TEAM_USERS,
        PERMISSIONS.VIEW_TEAM_USERS,
        PERMISSIONS.VIEW_OWN_TEAM,

    ],
    [ROLES.LEAD]: [
        PERMISSIONS.VIEW_TEAM_USERS,
        PERMISSIONS.VIEW_OWN_TEAM,

    ],
    [ROLES.MEMBER]: [
        PERMISSIONS.VIEW_TEAM_USERS,      // Can see logic in list_users backend
        PERMISSIONS.VIEW_OWN_TEAM,

    ],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role - The user's role string.
 * @param {string} permission - The permission to check.
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
};

/**
 * Check if a role has ANY of the provided permissions.
 * @param {string} role 
 * @param {string[]} permissionsList 
 */
export const hasAnyPermission = (role, permissionsList) => {
    if (!role) return false;
    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return permissionsList.some(p => userPermissions.includes(p));
};
