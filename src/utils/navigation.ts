import { navConfig, type NavItem, type NavContext } from '@/config/navConfig';
import { type UserRole, type UserProfile } from '@/types/team';

interface GetNavItemsParams {
    role: UserRole;
    context: NavContext;
    officeId?: string;
    departmentId?: string;
    userProfile?: UserProfile | null;
}

export function getNavItems({ role, context, officeId, departmentId, userProfile }: GetNavItemsParams): NavItem[] {
    return navConfig.filter(item => {
        // 1. Check Role
        if (!item.rolesAllowed.includes(role)) {
            return false;
        }

        // 2. Check Context
        if (!item.context.includes(context)) {
            return false;
        }

        return true;
    }).map(item => {
        // Replace dynamic params
        let finalPath = item.to;

        // Use URL param OR fallback to profile
        const targetOfficeId = officeId || userProfile?.officeId;
        const targetDeptId = departmentId || userProfile?.departmentId;

        if (targetOfficeId) {
            finalPath = finalPath.replace(':officeId', targetOfficeId);
        }
        if (targetDeptId) {
            finalPath = finalPath.replace(':departmentId', targetDeptId);
        }
        return { ...item, to: finalPath };
    });
}

/**
 * Groups nav items by section for rendering
 */
export function groupNavItems(items: NavItem[]) {
    return {
        primary: items.filter(i => i.section === 'primary'),
        organize: items.filter(i => i.section === 'organize'),
        measure: items.filter(i => i.section === 'measure'),
        configure: items.filter(i => i.section === 'configure'),
        utilities: items.filter(i => i.section === 'utilities'),
    };
}
