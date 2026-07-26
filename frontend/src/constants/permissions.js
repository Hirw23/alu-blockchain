// Mirrors backend/prisma/seed.js rolePermissionsMap and docs/backend_audit/permissions.md.
// The API never returns a permissions array to the client (only `role.name`), so this table
// is the client-side source of truth for UI gating. The server is the real enforcement point —
// getting this table out of sync only affects what the UI shows, never what the API allows.

export const ROLES = {
  PLATFORM_ADMIN: 'PlatformAdmin',
  COOPERATIVE_ADMIN: 'CooperativeAdmin',
  ENTREPRENEUR: 'Entrepreneur',
  BUYER: 'Buyer',
  FINANCIAL_INSTITUTION: 'FinancialInstitution',
};

export const ROLE_PERMISSIONS = {
  [ROLES.COOPERATIVE_ADMIN]: [
    'users:update',
    'business:view',
    'cooperative:view',
    'cooperative:manage',
    'product:view',
    'product:update',
    'supply-chain:view',
    'supply-chain:comment',
    'supply-chain:attachments',
    'product-identity:view',
    'verification:view',
    'verification:statistics',
    'analytics:view',
    'analytics:dashboard',
    'analytics:reports',
    'analytics:kpis',
    'reports:create',
    'health:view',
    'blockchain:view',
  ],
  [ROLES.ENTREPRENEUR]: [
    'business:create',
    'business:update',
    'business:view',
    'business:delete',
    'business:manage-members',
    'product:create',
    'product:view',
    'product:update',
    'product:delete',
    'product:archive',
    'product:manage-images',
    'product:manage-documents',
    'product:manage-categories',
    'product:view-statistics',
    'supply-chain:create',
    'supply-chain:update',
    'supply-chain:view',
    'supply-chain:comment',
    'supply-chain:attachments',
    'product-identity:create',
    'product-identity:view',
    'product-identity:update',
    'product-identity:delete',
    'qr:generate',
    'qr:download',
    'qr:regenerate',
    'verification:view',
    'verification:statistics',
    'analytics:view',
    'analytics:dashboard',
    'analytics:reports',
    'analytics:exports',
    'analytics:kpis',
    'analytics:comparisons',
    'reports:create',
    'reports:download',
    'reports:manage',
    'health:view',
    'blockchain:record',
    'blockchain:view',
  ],
  [ROLES.BUYER]: ['business:view', 'product:view', 'supply-chain:view', 'blockchain:view'],
  [ROLES.FINANCIAL_INSTITUTION]: [
    'business:view',
    'product:view',
    'supply-chain:view',
    'verification:view',
    'verification:statistics',
    'analytics:view',
    'analytics:reports',
    'analytics:kpis',
    'health:view',
    'blockchain:view',
  ],
};

// PlatformAdmin bypasses checkPermission entirely on the backend (middleware/auth.js) —
// treat it as having every permission rather than maintaining a duplicate full list here.
export function roleHasPermission(role, permission) {
  if (!permission) return true;
  if (role === ROLES.PLATFORM_ADMIN) return true;
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}
