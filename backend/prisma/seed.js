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
  { name: 'products:create', description: 'Register new products' },
  { name: 'products:update', description: 'Update product items' },
  { name: 'products:view', description: 'View product details' },
  { name: 'reports:view', description: 'View audit reports' },
  { name: 'analytics:view', description: 'Access dashboard analytics data' },
  { name: 'admin:access', description: 'Access platform administrator settings' },
];

const rolePermissionsMap = {
  PlatformAdmin: [
    'users:create', 'users:update', 'users:delete',
    'business:create', 'business:update',
    'products:create', 'products:update', 'products:view',
    'reports:view', 'analytics:view', 'admin:access'
  ],
  CooperativeAdmin: [
    'users:update', 'business:update',
    'products:view', 'reports:view', 'analytics:view'
  ],
  Entrepreneur: [
    'business:create', 'business:update',
    'products:create', 'products:update', 'products:view',
    'reports:view', 'analytics:view'
  ],
  Buyer: [
    'products:view'
  ],
  FinancialInstitution: [
    'products:view', 'reports:view', 'analytics:view'
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
