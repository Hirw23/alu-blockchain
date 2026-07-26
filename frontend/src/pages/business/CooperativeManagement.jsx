import { useEffect, useState } from 'react';
import cooperativesService from '../../services/cooperatives';
import businessesService from '../../services/businesses';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = { cooperativeName: '', description: '', registrationNumber: '', email: '', phoneNumber: '' };

function CooperativeFormModal({ open, onClose, onSaved, cooperative }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        cooperative
          ? {
              cooperativeName: cooperative.cooperativeName,
              description: cooperative.description || '',
              registrationNumber: cooperative.registrationNumber,
              email: cooperative.email,
              phoneNumber: cooperative.phoneNumber,
            }
          : EMPTY_FORM
      );
      setError('');
    }
  }, [open, cooperative]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (cooperative) {
        await cooperativesService.update(cooperative.id, form);
      } else {
        await cooperativesService.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save cooperative.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cooperative ? 'Edit Cooperative' : 'Create Cooperative'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="coop-form" loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <form id="coop-form" onSubmit={handleSubmit} className="space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <FormField label="Cooperative Name" required>
          <input className={inputClassName} value={form.cooperativeName} onChange={(e) => set('cooperativeName', e.target.value)} required />
        </FormField>
        <FormField label="Registration Number" required>
          <input className={inputClassName} value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} required />
        </FormField>
        <FormField label="Email" required>
          <input type="email" className={inputClassName} value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </FormField>
        <FormField label="Phone Number" required>
          <input className={inputClassName} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} required />
        </FormField>
        <FormField label="Description" hint="Optional">
          <textarea className={`${inputClassName} min-h-[80px]`} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}

function CooperativeDetail({ cooperative, onClose, onChanged }) {
  const { hasPermission } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    Promise.all([
      cooperativesService.getBusinesses(cooperative.id),
      businessesService.getAll({ limit: 100 }),
    ])
      .then(([bizRes, allRes]) => {
        setBusinesses(bizRes.data?.data?.items || []);
        setAllBusinesses(allRes.data?.data?.items || []);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, [cooperative.id]);

  const availableBusinesses = allBusinesses.filter((b) => !businesses.some((m) => m.id === b.id));

  async function handleAdd(e) {
    e.preventDefault();
    if (!selectedBusinessId) return;
    setAdding(true);
    setError('');
    try {
      await cooperativesService.addBusiness(cooperative.id, selectedBusinessId);
      setSelectedBusinessId('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add business.'));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(businessId) {
    if (!window.confirm('Remove this business from the cooperative?')) return;
    await cooperativesService.removeBusiness(cooperative.id, businessId);
    load();
    onChanged();
  }

  return (
    <Modal open onClose={onClose} title={cooperative.cooperativeName} size="lg">
      <div className="space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        {hasPermission('cooperative:manage') && (
          <form onSubmit={handleAdd} className="flex gap-md items-end">
            <FormField label="Add Business" className="flex-1">
              <select className={inputClassName} value={selectedBusinessId} onChange={(e) => setSelectedBusinessId(e.target.value)}>
                <option value="">Select a business</option>
                {availableBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.businessName}</option>
                ))}
              </select>
            </FormField>
            <Button type="submit" loading={adding} disabled={!selectedBusinessId} icon="add">
              Add
            </Button>
          </form>
        )}
        <DataTable
          loading={loading}
          data={businesses}
          emptyTitle="No member businesses yet"
          columns={[
            { key: 'businessName', header: 'Business' },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'verificationStatus', header: 'Verification', render: (row) => <StatusBadge status={row.verificationStatus} /> },
            {
              key: 'actions',
              header: '',
              render: (row) =>
                hasPermission('cooperative:manage') && (
                  <button onClick={() => handleRemove(row.id)} className="text-error hover:underline font-label-sm text-label-sm">
                    Remove
                  </button>
                ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}

export default function CooperativeManagement() {
  const { hasPermission } = useAuth();
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  function load() {
    setLoading(true);
    cooperativesService
      .getAll()
      .then((res) => setCooperatives(res.data?.data?.items || []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(e, coop) {
    e.stopPropagation();
    if (!window.confirm(`Delete cooperative "${coop.cooperativeName}"?`)) return;
    await cooperativesService.delete(coop.id);
    load();
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Cooperatives</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage cooperative organizations and their member businesses.
          </p>
        </div>
        {hasPermission('cooperative:create') && (
          <Button
            icon="add"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Create Cooperative
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : cooperatives.length === 0 ? (
        <Card>
          <EmptyState icon="groups" title="No cooperatives yet" description="Create your first cooperative to start grouping member businesses." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {cooperatives.map((coop) => (
            <Card
              key={coop.id}
              className="p-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewing(coop)}
            >
              <div className="flex items-start justify-between mb-sm">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <StatusBadge status={coop.status} />
              </div>
              <h3 className="font-headline text-headline-md text-on-surface mb-1">{coop.cooperativeName}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2">
                {coop.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between pt-sm border-t border-outline-variant">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{coop.registrationNumber}</span>
                <div className="flex gap-sm">
                  {hasPermission('cooperative:update') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(coop);
                        setFormOpen(true);
                      }}
                      className="text-primary hover:underline font-label-sm text-label-sm"
                    >
                      Edit
                    </button>
                  )}
                  {hasPermission('cooperative:manage') && (
                    <button onClick={(e) => handleDelete(e, coop)} className="text-error hover:underline font-label-sm text-label-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CooperativeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        cooperative={editing}
      />
      {viewing && <CooperativeDetail cooperative={viewing} onClose={() => setViewing(null)} onChanged={load} />}
    </div>
  );
}
