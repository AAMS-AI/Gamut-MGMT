# Role-Based Access Control

## User Roles

### 🏢 Organization Owner
- **Access**: ALL teams and claims across the organization
- **Permissions**:
  - View all teams and their claims
  - Approve/reject any claim
  - Grant admin rights to managers
  - Manage organization settings
- **Demo Account**: owner@gamut.com / owner123

### 👔 Manager
- **Access**: Own team only (unless granted admin rights)
- **Permissions**:
  - View own team's claims
  - Approve/reject claims for own team
  - Manage team members
  - View team performance
- **Admin Rights**: Can be granted by org owner to see ALL teams
- **Demo Accounts**:
  - manager1@gamut.com / manager123 (Team 1 only)
  - manager2@gamut.com / manager123 (Has admin rights - sees all teams)

### 👤 Team Member
- **Access**: Own claims and information only
- **Permissions**:
  - View own claims
  - Submit new claims
  - Add comments to own claims
  - View own team information
- **Demo Account**: member@gamut.com / member123

## Permission Flags

- `isOrgOwner`: User is organization owner
- `isManager`: User is a team manager
- `isTeamMember`: User is a team member
- `hasAdminRights`: User has admin rights (org owner always true, managers can be granted)
- `canViewAllTeams`: Can view all teams (org owner or manager with admin rights)
- `canApprove`: Can approve claims (org owner or manager)

## Implementation

The permission system is implemented in `AuthContext.jsx` and used throughout the app to:
- Filter visible claims based on user's team
- Show/hide approval buttons
- Control navigation visibility
- Restrict data access
