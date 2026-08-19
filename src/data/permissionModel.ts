export type Role = 'owner' | 'manager' | 'staff' | 'viewer';
export type Perm = 'view_dashboard' | 'manage_users' | 'edit_products' | 'view_reports' | 'approve_requests' | 'manage_settings';
export type OverrideType = 'allow' | 'deny' | null;

export const permLabels: Record<Perm, string> = {
  view_dashboard: 'View Dashboard',
  manage_users: 'Manage Users',
  edit_products: 'Edit Products',
  view_reports: 'View Reports',
  approve_requests: 'Approve Requests',
  manage_settings: 'Manage Settings',
};

export const roleLabels: Record<Role, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
  viewer: 'Viewer',
};

export interface Scenario {
  id: string;
  label: string;
  roles: { name: string; role: Role }[];
  basePermissions: Record<Role, Record<Perm, boolean>>;
}

export interface Override {
  perm: Perm;
  type: AllowDeny;
}

export type AllowDeny = 'allow' | 'deny';

export interface EffectivePerm {
  perm: Perm;
  allowed: boolean;
  source: 'role' | 'override';
  overrideType?: AllowDeny;
}

export interface AccessTestResult {
  granted: boolean;
  user: string;
  role: Role;
  permission: Perm;
  source: 'role' | 'override';
  reason: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'small-team', label: 'SMALL TEAM',
    roles: [
      { name: 'Alex', role: 'owner' },
      { name: 'Maya', role: 'manager' },
      { name: 'Sam', role: 'staff' },
      { name: 'Jordan', role: 'viewer' },
    ],
    basePermissions: {
      owner:   { view_dashboard: true, manage_users: true, edit_products: true, view_reports: true, approve_requests: true, manage_settings: true },
      manager: { view_dashboard: true, manage_users: true, edit_products: true, view_reports: true, approve_requests: true, manage_settings: false },
      staff:   { view_dashboard: true, manage_users: false, edit_products: true, view_reports: false, approve_requests: false, manage_settings: false },
      viewer:  { view_dashboard: true, manage_users: false, edit_products: false, view_reports: true, approve_requests: false, manage_settings: false },
    },
  },
  {
    id: 'finance', label: 'FINANCE APPROVAL',
    roles: [
      { name: 'Diana', role: 'owner' },
      { name: 'Raj', role: 'manager' },
      { name: 'Lin', role: 'staff' },
      { name: 'Omar', role: 'viewer' },
    ],
    basePermissions: {
      owner:   { view_dashboard: true, manage_users: true, edit_products: true, view_reports: true, approve_requests: true, manage_settings: true },
      manager: { view_dashboard: true, manage_users: false, edit_products: false, view_reports: true, approve_requests: true, manage_settings: false },
      staff:   { view_dashboard: true, manage_users: false, edit_products: false, view_reports: true, approve_requests: false, manage_settings: false },
      viewer:  { view_dashboard: true, manage_users: false, edit_products: false, view_reports: false, approve_requests: false, manage_settings: false },
    },
  },
  {
    id: 'content', label: 'CONTENT TEAM',
    roles: [
      { name: 'Sara', role: 'owner' },
      { name: 'Tom', role: 'manager' },
      { name: 'Kai', role: 'staff' },
      { name: 'Noor', role: 'viewer' },
    ],
    basePermissions: {
      owner:   { view_dashboard: true, manage_users: true, edit_products: true, view_reports: true, approve_requests: true, manage_settings: true },
      manager: { view_dashboard: true, manage_users: false, edit_products: true, view_reports: true, approve_requests: true, manage_settings: false },
      staff:   { view_dashboard: true, manage_users: false, edit_products: true, view_reports: false, approve_requests: false, manage_settings: false },
      viewer:  { view_dashboard: true, manage_users: false, edit_products: false, view_reports: true, approve_requests: false, manage_settings: false },
    },
  },
];

export const testActions: Perm[] = [
  'view_dashboard', 'manage_users', 'edit_products',
  'view_reports', 'approve_requests', 'manage_settings',
];

// Engine functions
export function getEffectivePermissions(
  role: Role,
  overrides: Partial<Record<Perm, OverrideType>>,
  basePermissions: Record<Role, Record<Perm, boolean>>
): EffectivePerm[] {
  return (Object.keys(permLabels) as Perm[]).map((perm) => {
    const baseAllowed = basePermissions[role][perm];
    const override = overrides[perm];

    if (override === 'deny') {
      return { perm, allowed: false, source: 'override', overrideType: 'deny' };
    }
    if (override === 'allow') {
      return { perm, allowed: true, source: 'override', overrideType: 'allow' };
    }
    return { perm, allowed: baseAllowed, source: 'role' };
  });
}

export function testAccess(
  effectivePerms: EffectivePerm[],
  action: Perm,
  userName: string,
  role: Role
): AccessTestResult {
  const ep = effectivePerms.find((e) => e.perm === action);
  if (!ep) {
    return {
      granted: false, user: userName, role, permission: action,
      source: 'role', reason: 'Permission not defined.',
    };
  }

  if (ep.source === 'override') {
    return {
      granted: ep.allowed,
      user: userName,
      role,
      permission: action,
      source: 'override',
      reason: ep.allowed
        ? `Explicit user override grants access.`
        : `Explicit user override denies access.`,
    };
  }

  return {
    granted: ep.allowed,
    user: userName,
    role,
    permission: action,
    source: 'role',
    reason: ep.allowed
      ? `Role ${roleLabels[role]} grants this permission.`
      : `Role ${roleLabels[role]} does not include this permission.`,
  };
}

export function countEffective(effectivePerms: EffectivePerm[]): { allowed: number; denied: number } {
  const allowed = effectivePerms.filter((p) => p.allowed).length;
  return { allowed, denied: effectivePerms.length - allowed };
}
