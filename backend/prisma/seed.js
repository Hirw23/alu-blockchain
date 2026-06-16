import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rolesData = [
  { name: 'Entrepreneur', description: 'Business owners registering products and tracking items' },
  { name: 'CooperativeAdmin', description: 'Administrators managing cooperative groups' },
  { name: 'Buyer', description: 'Consumers and buyers scanning product QR codes' },
  { name: 'FinancialInstitution', description: 'Entities auditing business credibility for financing' },
  { name: 'PlatformAdmin', description: 'Super administrators managing overall system operations' },
];

const permissionsData = [
  { name: 'users:create', description: 'Create user profiles' },
  { name: 'users:update', description: 'Update user profiles' },
  { name: 'users:delete', description: 'Delete user profiles' },
  { name: 'business:create', description: 'Create business listings' },
  { name: 'business:update', description: 'Update business profiles' },
  { name: 'business:view', description: 'View business profiles' },
  { name: 'business:delete', description: 'Delete business listings' },
  { name: 'business:verify', description: 'Verify business credentials' },
  { name: 'business:manage-members', description: 'Assign or remove business members' },
  { name: 'cooperative:create', description: 'Create cooperative entities' },
  { name: 'cooperative:update', description: 'Update cooperative details' },
  { name: 'cooperative:view', description: 'View cooperative listings' },
  { name: 'cooperative:manage', description: 'Manage cooperative business memberships' },
  { name: 'product:create', description: 'Register products' },
  { name: 'product:view', description: 'View product catalog details' },
  { name: 'product:update', description: 'Modify product properties' },
  { name: 'product:delete', description: 'Delete product listings' },
  { name: 'product:archive', description: 'Deactivate lifecycle status' },
  { name: 'product:manage-images', description: 'Add or remove product visuals' },
  { name: 'product:manage-documents', description: 'Manage compliance cert labels' },
  { name: 'product:manage-categories', description: 'Configure product category hierarchies' },
  { name: 'product:view-statistics', description: 'Access detail statistics' },
  { name: 'reports:view', description: 'View audit reports' },
  { name: 'analytics:view', description: 'Access dashboard analytics data' },
  { name: 'admin:access', description: 'Access platform administrator settings' },
  { name: 'supply-chain:create', description: 'Log trace events' },
  { name: 'supply-chain:update', description: 'Edit pending events' },
  { name: 'supply-chain:view', description: 'View event timelines' },
  { name: 'supply-chain:lock', description: 'Freeze event sequence' },
  { name: 'supply-chain:audit', description: 'Audit timeline events' },
  { name: 'supply-chain:comment', description: 'Post timeline comments' },
  { name: 'supply-chain:attachments', description: 'Upload timeline attachments' },
  { name: 'product-identity:create', description: 'Create digital identities' },
  { name: 'product-identity:view', description: 'View identity details' },
  { name: 'product-identity:update', description: 'Modify identity metadata' },
  { name: 'product-identity:delete', description: 'Remove digital identity' },
  { name: 'qr:generate', description: 'Generate QR codes' },
  { name: 'qr:download', description: 'Download QR sheets' },
  { name: 'qr:regenerate', description: 'Regenerate QR token versions' },
  { name: 'verification:view', description: 'View verification scans log' },
  { name: 'verification:statistics', description: 'Access scan analytics metrics' },
  { name: 'analytics:view', description: 'Access general analytics view' },
  { name: 'analytics:dashboard', description: 'View business dashboards' },
  { name: 'analytics:reports', description: 'View dashboard reports' },
  { name: 'analytics:exports', description: 'Export report documents' },
  { name: 'analytics:kpis', description: 'Access KPI metrics calculations' },
  { name: 'analytics:comparisons', description: 'Access comparison trends' },
  { name: 'reports:create', description: 'Register report definitions' },
  { name: 'reports:download', description: 'Download generated export sheets' },
  { name: 'reports:manage', description: 'Delete or edit report configs' },
  { name: 'admin:view', description: 'Access system admin reports' },
  { name: 'admin:manage', description: 'Govern platform features and user blocks' },
  { name: 'audit:view', description: 'Access security audit log history' },
  { name: 'notifications:manage', description: 'Send platform notifications' },
  { name: 'announcements:manage', description: 'Publish announcements feed' },
  { name: 'settings:update', description: 'Modify application settings values' },
  { name: 'features:update', description: 'Toggle feature flags' },
  { name: 'maintenance:manage', description: 'Toggle maintenance lock status' },
  { name: 'roles:manage', description: 'Govern RBAC roles mapping' },
  { name: 'permissions:manage', description: 'Govern permissions registry' },
  { name: 'users:manage', description: 'Deactivate or reset user accounts' },
  { name: 'health:view', description: 'Access system health status details' },
];

const rolePermissionsMap = {
  PlatformAdmin: [
    'users:create', 'users:update', 'users:delete',
    'business:create', 'business:update', 'business:view', 'business:delete', 'business:verify', 'business:manage-members',
    'cooperative:create', 'cooperative:update', 'cooperative:view', 'cooperative:manage',
    'product:create', 'product:view', 'product:update', 'product:delete', 'product:archive', 'product:manage-images', 'product:manage-documents', 'product:manage-categories', 'product:view-statistics',
    'reports:view', 'analytics:view', 'admin:access',
    'supply-chain:create', 'supply-chain:update', 'supply-chain:view', 'supply-chain:lock', 'supply-chain:audit', 'supply-chain:comment', 'supply-chain:attachments',
    'product-identity:create', 'product-identity:view', 'product-identity:update', 'product-identity:delete', 'qr:generate', 'qr:download', 'qr:regenerate', 'verification:view', 'verification:statistics',
    'analytics:dashboard', 'analytics:reports', 'analytics:exports', 'analytics:kpis', 'analytics:comparisons', 'reports:create', 'reports:download', 'reports:manage',
    'admin:view', 'admin:manage', 'audit:view', 'notifications:manage', 'announcements:manage', 'settings:update', 'features:update', 'maintenance:manage', 'roles:manage', 'permissions:manage', 'users:manage', 'health:view'
  ],
  CooperativeAdmin: [
    'users:update', 'business:view',
    'cooperative:view', 'cooperative:manage',
    'product:view', 'product:update', 'reports:view', 'analytics:view',
    'supply-chain:view', 'supply-chain:comment', 'supply-chain:attachments',
    'product-identity:view', 'verification:view', 'verification:statistics',
    'analytics:dashboard', 'analytics:reports', 'analytics:kpis', 'reports:create',
    'health:view'
  ],
  Entrepreneur: [
    'business:create', 'business:update', 'business:view', 'business:delete', 'business:manage-members',
    'product:create', 'product:view', 'product:update', 'product:delete', 'product:archive', 'product:manage-images', 'product:manage-documents', 'product:manage-categories', 'product:view-statistics',
    'reports:view', 'analytics:view',
    'supply-chain:create', 'supply-chain:update', 'supply-chain:view', 'supply-chain:comment', 'supply-chain:attachments',
    'product-identity:create', 'product-identity:view', 'product-identity:update', 'product-identity:delete', 'qr:generate', 'qr:download', 'qr:regenerate', 'verification:view', 'verification:statistics',
    'analytics:dashboard', 'analytics:reports', 'analytics:exports', 'analytics:kpis', 'analytics:comparisons', 'reports:create', 'reports:download', 'reports:manage',
    'health:view'
  ],
  Buyer: [
    'business:view',
    'product:view',
    'supply-chain:view'
  ],
  FinancialInstitution: [
    'business:view',
    'product:view', 'reports:view', 'analytics:view',
    'supply-chain:view', 'verification:view', 'verification:statistics',
    'analytics:kpis', 'analytics:reports',
    'health:view'
  ]
};

async function main() {
  console.log('🌱 Start seeding database...');

  // Seed Permissions
  console.log('Seeding permissions...');
  const permissions = {};
  for (const perm of permissionsData) {
    const upserted = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    permissions[perm.name] = upserted;
  }

  // Seed Roles
  console.log('Seeding roles...');
  const roles = {};
  for (const role of rolesData) {
    const upserted = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roles[role.name] = upserted;
  }

  // Link Roles and Permissions
  console.log('Seeding role-permission mappings...');
  for (const [roleName, permNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roles[roleName].id;
    for (const permName of permNames) {
      const permissionId = permissions[permName].id;
      
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId }
        },
        update: {},
        create: { roleId, permissionId }
      });
    }
  }

  // Seed Supply Chain Event Types
  console.log('Seeding supply chain event types...');
  const eventTypes = [
    { name: 'Harvested', category: 'Production', description: 'Raw materials harvested' },
    { name: 'Manufactured', category: 'Production', description: 'Product assembly/processing complete' },
    { name: 'Processed', category: 'Production', description: 'Post-harvest processing completed' },
    { name: 'Packaged', category: 'Production', description: 'Product containerized and labelled' },
    { name: 'Inspected', category: 'Quality', description: 'Product quality inspection check performed' },
    { name: 'Certified', category: 'Quality', description: 'Regulatory/organic certification issued' },
    { name: 'Tested', category: 'Quality', description: 'Lab testing validation results recorded' },
    { name: 'Stored', category: 'Storage', description: 'Stock stored in standard holding area' },
    { name: 'Warehouse Arrival', category: 'Storage', description: 'Shipment received at storage facility' },
    { name: 'Warehouse Departure', category: 'Storage', description: 'Shipment dispatched from storage facility' },
    { name: 'Dispatched', category: 'Transportation', description: 'Consignment handed over to shipping provider' },
    { name: 'Transported', category: 'Transportation', description: 'Consignment in-transit log updated' },
    { name: 'Delivered', category: 'Transportation', description: 'Shipment arrived at destination' },
    { name: 'Retail Arrival', category: 'Retail', description: 'Goods received on retail shelves' },
    { name: 'Purchased', category: 'Retail', description: 'Consumer checkout purchase registration' },
    { name: 'Returned', category: 'Retail', description: 'Product returned by consumer' },
    { name: 'Custom', category: 'Other', description: 'Ad-hoc trace tracking event log' }
  ];

  for (const type of eventTypes) {
    await prisma.supplyChainEventType.upsert({
      where: { name: type.name },
      update: { category: type.category, description: type.description },
      create: type
    });
  }

  // Seed default admin user to bind settings and feature flags updates
  console.log('Seeding default administrator user...');
  const adminRole = roles['PlatformAdmin'];
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@supplychainplus.com' },
    update: {},
    create: {
      id: 'admin-user-uuid-12345',
      email: 'admin@supplychainplus.com',
      passwordHash: '$2b$10$EpjX0VOqXYrrjhCoa6.TbeZ0jU9n3zD6G/qEa1l0bJk1l2m3n4o5p', // testpass
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      roleId: adminRole.id,
    },
  });

  // Seed platform settings
  console.log('Seeding default platform settings...');
  const defaultSettings = [
    { settingKey: 'Registration Enabled', settingValue: 'true', category: 'Security', description: 'Enable user registration' },
    { settingKey: 'Maintenance Mode', settingValue: 'false', category: 'System', description: 'Force maintenance lockout responses' },
    { settingKey: 'QR Expiration Period', settingValue: '365', category: 'QR Code', description: 'Expiration period in days' },
  ];
  for (const setting of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { settingKey: setting.settingKey },
      update: {},
      create: {
        ...setting,
        updatedBy: adminUser.id,
      },
    });
  }

  // Seed feature flags
  console.log('Seeding default feature flags...');
  const defaultFlags = [
    { featureName: 'Blockchain Enabled', enabled: false, description: 'Enable blockchain anchors' },
    { featureName: 'Analytics Enabled', enabled: true, description: 'Enable analytics engine' },
    { featureName: 'QR Verification Enabled', enabled: true, description: 'Enable verification services' },
  ];
  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { featureName: flag.featureName },
      update: {},
      create: {
        ...flag,
        updatedBy: adminUser.id,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
