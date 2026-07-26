import { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/admin';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';

function CreateRoleModal({ open, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminService.createRole({ name, description });
      setName('');
      setDescription('');
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create role.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Role"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="role-form" loading={saving}>Create</Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <FormField label="Role Name" required>
          <input className={inputClassName} value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>
        <FormField label="Description" hint="Optional">
          <textarea className={`${inputClassName} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([adminService.getRoles(), adminService.getPermissions()])
      .then(([rolesRes, permsRes]) => {
        const roleList = rolesRes.data?.data?.roles || [];
        setRoles(roleList);
        setPermissions(permsRes.data?.data?.permissions || []);
        setSelectedRoleId((current) => current || roleList[0]?.id || null);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissionIds(new Set(selectedRole.permissions.map((rp) => rp.permission.id)));
      setSuccess('');
    }
  }, [selectedRole]);

  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach((p) => {
      const category = p.name.split(':')[0];
      groups[category] = groups[category] || [];
      groups[category].push(p);
    });
    return groups;
  }, [permissions]);

  function togglePermission(id) {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await adminService.assignPermissions(selectedRoleId, Array.from(selectedPermissionIds));
      setSuccess('Permissions updated.');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update permissions.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole(roleId) {
    if (!window.confirm('Delete this role? Users assigned to it will be affected.')) return;
    try {
      await adminService.deleteRole(roleId);
      setSelectedRoleId(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete role.'));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  const isBuiltIn = ['PlatformAdmin', 'CooperativeAdmin', 'Entrepreneur', 'Buyer', 'FinancialInstitution'].includes(
    selectedRole?.name
  );

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Roles & Permissions</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Configure the platform's RBAC roles and their granular permissions.
          </p>
        </div>
        <Button icon="add" onClick={() => setCreateOpen(true)}>Create Role</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        <Card className="p-md lg:col-span-1 h-fit">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-sm px-sm">
            System Roles
          </p>
          <div className="space-y-1">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-md py-sm rounded-lg font-label-md text-label-md transition-colors flex items-center justify-between ${
                  role.id === selectedRoleId
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{role.name}</span>
                <span className="font-label-sm text-label-sm opacity-70">{role.permissions.length}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title={selectedRole?.name || 'Select a role'}
            description={selectedRole?.description || 'Toggle permissions granted to this role.'}
            action={
              selectedRole &&
              !isBuiltIn && (
                <button onClick={() => handleDeleteRole(selectedRole.id)} className="text-error hover:underline font-label-sm text-label-sm">
                  Delete Role
                </button>
              )
            }
          />
          <div className="p-lg space-y-lg">
            <ErrorBanner>{error}</ErrorBanner>
            {success && (
              <div className="p-md bg-secondary-container/30 text-on-secondary-container rounded-lg font-body-sm text-body-sm">
                {success}
              </div>
            )}
            {selectedRole?.name === 'PlatformAdmin' && (
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                PlatformAdmin bypasses permission checks on the backend regardless of this list — it
                always has full access.
              </p>
            )}
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category}>
                <h4 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-sm">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perms.map((perm) => (
                    <label key={perm.id} className="flex items-start gap-2 p-sm rounded-md hover:bg-surface-container-low cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedPermissionIds.has(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface">{perm.name}</p>
                        {perm.description && (
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
              <Button variant="secondary" onClick={() => setSelectedPermissionIds(new Set(selectedRole.permissions.map((rp) => rp.permission.id)))}>
                Reset Changes
              </Button>
              <Button onClick={handleSave} loading={saving} icon="save">
                Save Permissions
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={load} />
    </div>
  );
}
