import { useEffect, useState } from 'react';
import adminService, { ANNOUNCEMENT_AUDIENCES, ANNOUNCEMENT_PRIORITIES } from '../../services/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';

const EMPTY_FORM = { title: '', message: '', audience: ANNOUNCEMENT_AUDIENCES[0], priority: 'NORMAL', expiresAt: '' };

function ComposeModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError('');
    }
  }, [open]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminService.createAnnouncement({
        ...form,
        expiresAt: form.expiresAt || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not publish announcement.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose Announcement"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="announcement-form" loading={saving} icon="campaign">
            Publish
          </Button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={handleSubmit} className="space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <FormField label="Subject" required>
          <input className={inputClassName} value={form.title} onChange={(e) => set('title', e.target.value)} required minLength={3} maxLength={100} />
        </FormField>
        <FormField label="Message" required>
          <textarea className={`${inputClassName} min-h-[100px]`} value={form.message} onChange={(e) => set('message', e.target.value)} required minLength={5} maxLength={1000} />
        </FormField>
        <div className="grid grid-cols-2 gap-lg">
          <FormField label="Audience" required>
            <select className={inputClassName} value={form.audience} onChange={(e) => set('audience', e.target.value)}>
              {ANNOUNCEMENT_AUDIENCES.map((a) => (
                <option key={a} value={a}>{a.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={inputClassName} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {ANNOUNCEMENT_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Expires At" hint="Optional">
          <input type="datetime-local" className={inputClassName} value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}

export default function NotificationsAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  function load() {
    setLoading(true);
    adminService.getAnnouncements().then((res) => setAnnouncements(res.data?.data?.announcements || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleTogglePublish(announcement) {
    await adminService.updateAnnouncement(announcement.id, { published: !announcement.published });
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return;
    await adminService.deleteAnnouncement(id);
    load();
  }

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Announcements</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Broadcast platform-wide or audience-targeted announcements.
          </p>
        </div>
        <Button icon="campaign" onClick={() => setComposeOpen(true)}>Compose Announcement</Button>
      </div>

      <Card>
        <DataTable
          loading={loading}
          data={announcements}
          emptyTitle="No announcements yet"
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'audience', header: 'Audience', render: (row) => row.audience.replaceAll('_', ' ') },
            { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
            {
              key: 'published',
              header: 'Status',
              render: (row) => (
                <button onClick={() => handleTogglePublish(row)} className="cursor-pointer">
                  <StatusBadge status={row.published ? 'ACTIVE' : 'DRAFT'} label={row.published ? 'Published' : 'Draft'} />
                </button>
              ),
            },
            { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <button onClick={() => handleDelete(row.id)} className="text-error hover:underline font-label-sm text-label-sm">
                  Delete
                </button>
              ),
            },
          ]}
        />
      </Card>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} onSaved={load} />
    </div>
  );
}
