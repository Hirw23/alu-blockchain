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
];

const rolePermissionsMap = {
  PlatformAdmin: [
    'users:create', 'users:update', 'users:delete',
    'business:create', 'business:update', 'business:view', 'business:delete', 'business:verify', 'business:manage-members',
    'cooperative:create', 'cooperative:update', 'cooperative:view', 'cooperative:manage',
    'product:create', 'product:view', 'product:update', 'product:delete', 'product:archive', 'product:manage-images', 'product:manage-documents', 'product:manage-categories', 'product:view-statistics',
    'reports:view', 'analytics:view', 'admin:access',
    'supply-chain:create', 'supply-chain:update', 'supply-chain:view', 'supply-chain:lock', 'supply-chain:audit', 'supply-chain:comment', 'supply-chain:attachments'
  ],
  CooperativeAdmin: [
    'users:update', 'business:view',
    'cooperative:view', 'cooperative:manage',
    'product:view', 'product:update', 'reports:view', 'analytics:view',
    'supply-chain:view', 'supply-chain:comment', 'supply-chain:attachments'
  ],
  Entrepreneur: [
    'business:create', 'business:update', 'business:view', 'business:delete', 'business:manage-members',
    'product:create', 'product:view', 'product:update', 'product:delete', 'product:archive', 'product:manage-images', 'product:manage-documents', 'product:manage-categories', 'product:view-statistics',
    'reports:view', 'analytics:view',
    'supply-chain:create', 'supply-chain:update', 'supply-chain:view', 'supply-chain:comment', 'supply-chain:attachments'
  ],
  Buyer: [
    'business:view',
    'product:view',
    'supply-chain:view'
  ],
  FinancialInstitution: [
    'business:view',
    'product:view', 'reports:view', 'analytics:view',
    'supply-chain:view'
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
