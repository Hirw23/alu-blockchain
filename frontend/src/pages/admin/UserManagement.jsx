import { useEffect, useState } from 'react';
import adminService, { USER_STATUSES } from '../../services/admin';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { inputClassName } from '../../components/ui/FormField';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    adminService.getRoles().then((res) => setRoles(res.data?.data?.roles || []));
  }, []);

  function load() {
    setLoading(true);
    adminService
      .getUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit: 15,
      })
      .then((res) => {
        setUsers(res.data?.data?.users || []);
        setTotal(res.data?.data?.total || 0);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, [roleFilter, statusFilter, page]);

  async function handleStatusChange(userId, status) {
    await adminService.updateUserStatus(userId, status);
    load();
  }

  async function handleRoleChange(userId, roleId) {
    await adminService.updateUserRoles(userId, roleId);
    load();
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">User Management</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage platform accounts, roles, and account status.
        </p>
      </div>

      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <select className={`${inputClassName} sm:w-56`} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
          <select className={`${inputClassName} sm:w-56`} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Statuses</option>
            {USER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <DataTable
          loading={loading}
          data={users}
          page={page}
          pageSize={15}
          total={total}
          onPageChange={setPage}
          emptyTitle="No users found"
          columns={[
            {
              key: 'name',
              header: 'User',
              render: (row) => (
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{row.firstName} {row.lastName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: (row) =>
                hasPermission('users:manage') ? (
                  <select
                    className="border border-outline-variant rounded-md px-2 py-1 font-body-sm text-body-sm bg-transparent"
                    value={row.roleId}
                    onChange={(e) => handleRoleChange(row.id, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                ) : (
                  row.role?.name
                ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) =>
                hasPermission('users:manage') ? (
                  <select
                    className="border border-outline-variant rounded-md px-2 py-1 font-body-sm text-body-sm bg-transparent"
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                  >
                    {USER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={row.status} />
                ),
            },
            {
              key: 'emailVerified',
              header: 'Verified',
              render: (row) => (row.emailVerified ? 'Yes' : 'No'),
            },
            {
              key: 'createdAt',
              header: 'Joined',
              render: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
          ]}
        />
      </Card>
    </div>
  );
}
