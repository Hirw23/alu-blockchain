// Central nav definition consumed by Sidebar.jsx. Every Stitch mockup used the same 6-item
// sidebar (Dashboard/Businesses/Products/Supply Chain/Analytics/Settings) regardless of role —
// here we gate each item by the permission that actually guards its underlying data, and add a
// separate "Platform Administration" group for PlatformAdmin-only screens that had no visible
// nav entry in the static mockups (they were only reachable via breadcrumbs like "Settings > X").
export function getPrimaryNavItems(auth) {
  const { role, hasPermission } = auth;
  const isEntrepreneur = role === 'Entrepreneur';

  return [
    { label: 'Dashboard', icon: 'dashboard', to: '/dashboard', show: true },
    {
      label: 'Businesses',
      icon: 'business_center',
      to: isEntrepreneur ? '/business' : '/businesses',
      show: hasPermission('business:view'),
    },
    {
      label: 'Cooperatives',
      icon: 'groups',
      to: '/cooperatives',
      show: hasPermission('cooperative:view'),
    },
    {
      label: 'Products',
      icon: 'inventory_2',
      to: '/products',
      show: hasPermission('product:view'),
    },
    {
      label: 'Supply Chain',
      icon: 'account_tree',
      to: '/supply-chain',
      show: hasPermission('supply-chain:view'),
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      to: '/analytics',
      show: hasPermission('analytics:view'),
    },
    {
      label: 'Reports',
      icon: 'summarize',
      to: '/reports',
      show: hasPermission('analytics:reports') || hasPermission('reports:create'),
    },
  ].filter((item) => item.show);
}

export function getAdminNavItems(auth) {
  if (auth.role !== 'PlatformAdmin') return [];
  return [
    { label: 'Business Oversight', icon: 'domain_verification', to: '/businesses' },
    { label: 'User Management', icon: 'manage_accounts', to: '/admin/users' },
    { label: 'Roles & Permissions', icon: 'admin_panel_settings', to: '/admin/roles' },
    { label: 'Audit Logs', icon: 'fact_check', to: '/admin/audit-logs' },
    { label: 'Announcements', icon: 'campaign', to: '/admin/announcements' },
    { label: 'Platform Settings', icon: 'settings', to: '/admin/settings' },
    { label: 'System Health', icon: 'monitor_heart', to: '/admin/system-health' },
    { label: 'Blockchain Monitoring', icon: 'hub', to: '/admin/blockchain' },
  ];
}

// Topbar contextual "quick add" per section — replaces the mockups' generic, unwired
// "New Transaction" button with a single action that actually points somewhere real.
export function getQuickAction(pathname, auth) {
  const { hasPermission } = auth;
  if (pathname.startsWith('/products') && hasPermission('product:create')) {
    return { label: 'New Product', to: '/products/new', icon: 'add_circle' };
  }
  if (pathname.startsWith('/supply-chain') && hasPermission('supply-chain:create')) {
    return { label: 'Log Event', to: '/supply-chain/events/new', icon: 'add_circle' };
  }
  if (pathname.startsWith('/cooperatives') && hasPermission('cooperative:create')) {
    return { label: 'Create Cooperative', to: '/cooperatives/new', icon: 'add_circle' };
  }
  if (pathname.startsWith('/business') && !pathname.startsWith('/businesses') && hasPermission('business:create')) {
    return { label: 'New Business', to: '/business/new', icon: 'add_circle' };
  }
  return null;
}
