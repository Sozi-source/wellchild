export type UserRole = 'parent' | 'healthcare' | 'admin';

export interface RoleConfig {
  label: string;
  description: string;
  color: string;
  icon: string;
  permissions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  parent: {
    label: 'Parent',
    description: 'Can add and track their own children\'s growth',
    color: 'blue',
    icon: '👨‍👩‍👧',
    permissions: ['view:own-children', 'add:measurements', 'view:reports']
  },
  healthcare: {
    label: 'Healthcare Provider',
    description: 'Can monitor multiple patients and generate reports',
    color: 'green',
    icon: '👨‍⚕️',
    permissions: ['view:all-children', 'add:measurements', 'edit:measurements', 'view:reports', 'generate:reports']
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access including user management',
    color: 'purple',
    icon: '👑',
    permissions: ['*'] // All permissions
  }
};

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role];
}

export function checkPermission(userRole: UserRole, requiredPermission: string): boolean {
  const config = ROLE_CONFIGS[userRole];
  
  // Admin has all permissions
  if (userRole === 'admin') return true;
  
  return config.permissions.includes(requiredPermission) || 
         config.permissions.includes('*');
}

export function getRoleBadgeClass(role: UserRole): string {
  const colorMap = {
    parent: 'bg-blue-100 text-blue-800',
    healthcare: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800'
  };
  
  return colorMap[role];
}