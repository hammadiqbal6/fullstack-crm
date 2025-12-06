import { User, Role } from './auth';

export type UserRole = 'admin' | 'user' | 'sales_rep' | 'viewer' | 'customer';

export interface RoleConfig {
  slug: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

export const ROLES: Record<UserRole, RoleConfig> = {
  admin: {
    slug: 'admin',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['*'], // All permissions
  },
  user: {
    slug: 'user',
    name: 'User',
    description: 'Staff member - manages assigned contacts',
    permissions: ['contacts.view', 'contacts.edit', 'questionnaires.manage', 'invoices.manage'],
  },
  sales_rep: {
    slug: 'sales_rep',
    name: 'Sales Rep',
    description: 'Sales representative access',
    permissions: ['contacts.view', 'contacts.edit', 'leads.view', 'invoices.manage'],
  },
  viewer: {
    slug: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['contacts.view', 'leads.view', 'invoices.view'],
  },
  customer: {
    slug: 'customer',
    name: 'Customer',
    description: 'Converted lead - can only access own profile',
    permissions: ['profile.view', 'profile.edit', 'questionnaires.respond', 'invoices.view'],
  },
};

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles: UserRole[];
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    roles: ['admin', 'user', 'sales_rep', 'viewer', 'customer'],
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'leads',
    roles: ['admin'],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: 'customers',
    roles: ['admin', 'user', 'sales_rep'],
  },
  {
    label: 'Questionnaires',
    href: '/questionnaires',
    icon: 'questionnaires',
    roles: ['admin', 'user', 'sales_rep', 'customer'],
  },
  {
    label: 'Invoices',
    href: '/invoices',
    icon: 'invoices',
    roles: ['admin', 'user', 'sales_rep', 'customer'],
  },
  {
    label: 'Profile',
    href: '/customer/profile',
    icon: 'profile',
    roles: ['customer'],
  },
];

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles?.some((r: Role) => r.slug === role) || false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.some(role => hasRole(user, role));
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Admin has all permissions
  if (hasRole(user, 'admin')) return true;
  
  // Check user's role permissions
  for (const role of user.roles || []) {
    const roleConfig = ROLES[role.slug as UserRole];
    if (roleConfig?.permissions.includes(permission) || roleConfig?.permissions.includes('*')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get navigation items for user based on their roles
 */
export function getNavItemsForUser(user: User | null): NavItem[] {
  if (!user) return [];
  
  return NAV_ITEMS.filter(item => 
    item.roles.some(role => hasRole(user, role))
  );
}

/**
 * Get primary role for user (highest priority)
 */
export function getPrimaryRole(user: User | null): UserRole | null {
  if (!user || !user.roles || user.roles.length === 0) return null;
  
  const rolePriority: UserRole[] = ['admin', 'user', 'sales_rep', 'viewer', 'customer'];
  
  for (const priority of rolePriority) {
    if (hasRole(user, priority)) {
      return priority;
    }
  }
  
  return user.roles[0].slug as UserRole;
}
