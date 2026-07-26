import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import businessesService, {
  BUSINESS_DOCUMENT_TYPES,
  BUSINESS_MEMBER_ROLES,
} from '../../services/businesses';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'profile', label: 'Profile', icon: 'business_center' },
  { key: 'address', label: 'Address', icon: 'location_on' },
  { key: 'documents', label: 'Documents', icon: 'description' },
  { key: 'members', label: 'Members', icon: 'group' },
];

function ProfileTab({ business, onSaved }) {
  const [form, setForm] = useState({
    businessName: business.businessName || '',
    tradingName: business.tradingName || '',
    description: business.description || '',
    businessType: business.businessType || '',
    industry: business.industry || '',
    registrationNumber: business.registrationNumber || '',
    taxIdentificationNumber: business.taxIdentificationNumber || '',
    email: business.email || '',
    phoneNumber: business.phoneNumber || '',
    website: business.website || '',
    establishedDate: business.establishedDate ? business.establishedDate.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await businessesService.update(business.id, {
        ...form,
        establishedDate: form.establishedDate || null,
      });
      setSuccess('Business profile updated.');
      onSaved?.();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update business profile.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-lg">
      <div className="flex items-center gap-3 mb-lg">
        <h3 className="font-headline text-headline-md text-on-surface">{business.businessName}</h3>
        <StatusBadge status={business.status} />
        <StatusBadge status={business.verificationStatus} />
      </div>
      <ErrorBanner>{error}</ErrorBanner>
      {success && (
        <div className="p-md mb-md bg-secondary-container/30 text-on-secondary-container rounded-lg font-body-sm text-body-sm">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <FormField label="Business Name" required>
            <input className={inputClassName} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} required />
          </FormField>
          <FormField label="Trading Name" required>
            <input className={inputClassName} value={form.tradingName} onChange={(e) => set('tradingName', e.target.value)} required />
          </FormField>
          <FormField label="Business Type" required>
            <input className={inputClassName} value={form.businessType} onChange={(e) => set('businessType', e.target.value)} required />
          </FormField>
          <FormField label="Industry" required>
            <input className={inputClassName} value={form.industry} onChange={(e) => set('industry', e.target.value)} required />
          </FormField>
          <FormField label="Registration Number" required>
            <input className={inputClassName} value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} required />
          </FormField>
          <FormField label="Tax Identification Number" required>
            <input className={inputClassName} value={form.taxIdentificationNumber} onChange={(e) => set('taxIdentificationNumber', e.target.value)} required />
          </FormField>
          <FormField label="Business Email" required>
            <input type="email" className={inputClassName} value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </FormField>
          <FormField label="Phone Number" required>
            <input className={inputClassName} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} required />
          </FormField>
          <FormField label="Website" hint="Optional">
            <input className={inputClassName} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
          </FormField>
          <FormField label="Established Date" hint="Optional">
            <input type="date" className={inputClassName} value={form.establishedDate} onChange={(e) => set('establishedDate', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Description" hint="Optional">
          <textarea className={`${inputClassName} min-h-[100px]`} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon="save">
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AddressTab({ businessId }) {
  const [address, setAddress] = useState(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    businessesService
      .getAddress(businessId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data?.address;
        if (data) {
          setAddress(data);
          setExists(true);
        }
      })
      .catch(() => {
        // No address recorded yet — the form below starts blank and creates one on submit.
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const [form, setForm] = useState({
    country: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    postalCode: '',
  });

  useEffect(() => {
    if (address) {
      setForm({
        country: address.country || '',
        province: address.province || '',
        district: address.district || '',
        sector: address.sector || '',
        cell: address.cell || '',
        village: address.village || '',
        postalCode: address.postalCode || '',
      });
    }
  }, [address]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (exists) {
        await businessesService.updateAddress(businessId, form);
      } else {
        await businessesService.createAddress(businessId, form);
        setExists(true);
      }
      setSuccess('Address saved.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save address.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-xl flex justify-center">
        <Spinner className="text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Business Address" description="Administrative address used on trust cards and compliance records." />
      <div className="p-lg">
        <ErrorBanner>{error}</ErrorBanner>
        {success && (
          <div className="p-md mb-md bg-secondary-container/30 text-on-secondary-container rounded-lg font-body-sm text-body-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <FormField label="Country" required>
            <input className={inputClassName} value={form.country} onChange={(e) => set('country', e.target.value)} required />
          </FormField>
          <FormField label="Province" required>
            <input className={inputClassName} value={form.province} onChange={(e) => set('province', e.target.value)} required />
          </FormField>
          <FormField label="District" required>
            <input className={inputClassName} value={form.district} onChange={(e) => set('district', e.target.value)} required />
          </FormField>
          <FormField label="Sector" required>
            <input className={inputClassName} value={form.sector} onChange={(e) => set('sector', e.target.value)} required />
          </FormField>
          <FormField label="Cell" required>
            <input className={inputClassName} value={form.cell} onChange={(e) => set('cell', e.target.value)} required />
          </FormField>
          <FormField label="Village" required>
            <input className={inputClassName} value={form.village} onChange={(e) => set('village', e.target.value)} required />
          </FormField>
          <FormField label="Postal Code" hint="Optional">
            <input className={inputClassName} value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
          </FormField>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" loading={saving} icon="save">
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

function DocumentsTab({ businessId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState(BUSINESS_DOCUMENT_TYPES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    businessesService
      .getDocuments(businessId)
      .then((res) => setDocuments(res.data?.data?.documents || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [businessId]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);
      await businessesService.addDocument(businessId, formData);
      setFile(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not record document.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId) {
    if (!window.confirm('Remove this document?')) return;
    await businessesService.deleteDocument(businessId, documentId);
    load();
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Compliance Documents" description="Registration certificates, tax certificates, and permits on file." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-md items-end">
          <FormField label="Document Type" className="w-full sm:w-56">
            <select className={inputClassName} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              {BUSINESS_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="File" className="w-full">
            <input
              type="file"
              accept=".pdf,image/*"
              className={inputClassName}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </FormField>
          <Button type="submit" loading={uploading} disabled={!file} icon="upload_file">
            Upload
          </Button>
        </form>

        <DataTable
          loading={loading}
          emptyTitle="No documents on file"
          data={documents}
          columns={[
            { key: 'documentType', header: 'Type' },
            { key: 'fileName', header: 'File' },
            {
              key: 'verificationStatus',
              header: 'Status',
              render: (row) => <StatusBadge status={row.verificationStatus} />,
            },
            {
              key: 'uploadedAt',
              header: 'Uploaded',
              render: (row) => new Date(row.uploadedAt).toLocaleDateString(),
            },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-error hover:underline font-label-sm text-label-sm"
                >
                  Remove
                </button>
              ),
            },
          ]}
        />
      </div>
    </Card>
  );
}

function MembersTab({ businessId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(BUSINESS_MEMBER_ROLES[1]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    businessesService
      .getMembers(businessId)
      .then((res) => setMembers(res.data?.data?.members || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [businessId]);

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      await businessesService.addMember(businessId, { userId, role });
      setUserId('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add member.'));
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(memberId, newRole) {
    await businessesService.updateMemberRole(businessId, memberId, newRole);
    load();
  }

  async function handleRemove(memberId) {
    if (!window.confirm('Remove this member from the business?')) return;
    await businessesService.removeMember(businessId, memberId);
    load();
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Team Members" description="Owners, managers, and employees with access to this business." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-md items-end">
          <FormField
            label="User ID"
            hint="The account's user ID — there is no user directory search yet, so ask the person to share their ID."
            className="w-full"
          >
            <input className={inputClassName} value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </FormField>
          <FormField label="Role" className="w-full sm:w-48">
            <select className={inputClassName} value={role} onChange={(e) => setRole(e.target.value)}>
              {BUSINESS_MEMBER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
          <Button type="submit" loading={adding} icon="person_add">
            Add Member
          </Button>
        </form>

        <DataTable
          loading={loading}
          emptyTitle="No team members yet"
          data={members}
          columns={[
            {
              key: 'user',
              header: 'Member',
              render: (row) => (row.user ? `${row.user.firstName} ${row.user.lastName} (${row.user.email})` : row.userId),
            },
            {
              key: 'role',
              header: 'Role',
              render: (row) => (
                <select
                  className="bg-transparent border border-outline-variant rounded-md px-2 py-1 font-body-sm text-body-sm"
                  value={row.role}
                  onChange={(e) => handleRoleChange(row.id, e.target.value)}
                >
                  {BUSINESS_MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              key: 'joinedAt',
              header: 'Joined',
              render: (row) => new Date(row.joinedAt).toLocaleDateString(),
            },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <button
                  onClick={() => handleRemove(row.id)}
                  className="text-error hover:underline font-label-sm text-label-sm"
                >
                  Remove
                </button>
              ),
            },
          ]}
        />
      </div>
    </Card>
  );
}

export default function BusinessManagement() {
  const { hasPermission } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  function load() {
    setLoading(true);
    businessesService
      .getMe()
      .then((res) => {
        const items = res.data?.data?.items || [];
        setBusinesses(items);
        setSelectedId((current) => current || items[0]?.id || null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const business = businesses.find((b) => b.id === selectedId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <Card>
        <EmptyState
          icon="business_center"
          title="No business registered yet"
          description="Complete your business setup to start registering products and tracking supply chain events."
          action={
            hasPermission('business:create') && (
              <Link to="/onboarding/business-setup">
                <Button icon="add_business">Set Up Your Business</Button>
              </Link>
            )
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Business Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your enterprise profile, address, documents, and team.
          </p>
        </div>
        {businesses.length > 1 && (
          <select
            className={`${inputClassName} w-full md:w-64`}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.businessName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-1 border-b border-outline-variant overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-md py-sm font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab business={business} onSaved={load} />}
      {tab === 'address' && <AddressTab businessId={business.id} />}
      {tab === 'documents' && <DocumentsTab businessId={business.id} />}
      {tab === 'members' && <MembersTab businessId={business.id} />}
    </div>
  );
}
